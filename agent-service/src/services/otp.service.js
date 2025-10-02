import pool from '../config/database.js';
import crypto from 'crypto';

class OTPService {
  constructor() {
    this.OTP_LENGTH = 6;
    this.OTP_EXPIRY_MINUTES = 10; // Updated from 5 to 10 minutes per agent login story requirements
    this.MAX_ATTEMPTS = 5;
    this.LOCKOUT_DURATION_MINUTES = 30;
  }

  /**
   * Generate a random 6-digit OTP code
   */
  generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Check if phone number is locked out
   */
  async isLockedOut(phoneNumber) {
    const query = `
      SELECT * FROM otp_lockouts
      WHERE phone_number = $1 AND locked_until > NOW()
    `;
    const result = await pool.query(query, [phoneNumber]);
    return result.rows.length > 0;
  }

  /**
   * Create or update lockout for phone number
   */
  async createLockout(phoneNumber) {
    const lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000);

    const query = `
      INSERT INTO otp_lockouts (phone_number, locked_until, attempt_count)
      VALUES ($1, $2, $3)
      ON CONFLICT (phone_number)
      DO UPDATE SET
        locked_until = $2,
        attempt_count = otp_lockouts.attempt_count + 1
      RETURNING *
    `;

    const result = await pool.query(query, [phoneNumber, lockedUntil, 1]);
    return result.rows[0];
  }

  /**
   * Clear lockout for phone number
   */
  async clearLockout(phoneNumber) {
    const query = 'DELETE FROM otp_lockouts WHERE phone_number = $1';
    await pool.query(query, [phoneNumber]);
  }

  /**
   * Create and send OTP code
   */
  async createOTP(phoneNumber, deliveryMethod = 'sms') {
    // Check if locked out
    if (await this.isLockedOut(phoneNumber)) {
      throw new Error('Too many failed attempts. Please try again later.');
    }

    // Invalidate any existing unused OTP codes for this phone
    await pool.query(
      'UPDATE otp_codes SET is_used = true WHERE phone_number = $1 AND is_used = false',
      [phoneNumber]
    );

    // Generate new code
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    const query = `
      INSERT INTO otp_codes (phone_number, code, delivery_method, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [phoneNumber, code, deliveryMethod, expiresAt]);

    // Mock SMS/Email sending - in production, integrate with Twilio/SendGrid
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📱 OTP Code for ${phoneNumber}`);
    console.log(`Code: ${code}`);
    console.log(`Delivery Method: ${deliveryMethod}`);
    console.log(`Expires at: ${expiresAt.toISOString()}`);
    console.log(`${'='.repeat(50)}\n`);

    return {
      id: result.rows[0].id,
      expiresAt: expiresAt.toISOString(),
      deliveryMethod,
      // Return code only in development
      ...(process.env.NODE_ENV === 'development' && { code }),
    };
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(phoneNumber, code) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get the most recent unused OTP
      const otpQuery = `
        SELECT * FROM otp_codes
        WHERE phone_number = $1 AND code = $2 AND is_used = false
        ORDER BY created_at DESC
        LIMIT 1
        FOR UPDATE
      `;

      const otpResult = await client.query(otpQuery, [phoneNumber, code]);

      if (otpResult.rows.length === 0) {
        // Increment lockout counter
        const lockoutQuery = `
          INSERT INTO otp_lockouts (phone_number, locked_until, attempt_count)
          VALUES ($1, NOW(), 1)
          ON CONFLICT (phone_number)
          DO UPDATE SET
            attempt_count = otp_lockouts.attempt_count + 1,
            locked_until = CASE
              WHEN otp_lockouts.attempt_count + 1 >= $2
              THEN NOW() + INTERVAL '${this.LOCKOUT_DURATION_MINUTES} minutes'
              ELSE otp_lockouts.locked_until
            END
          RETURNING attempt_count
        `;

        const lockoutResult = await client.query(lockoutQuery, [phoneNumber, this.MAX_ATTEMPTS]);
        const attemptCount = lockoutResult.rows[0].attempt_count;

        await client.query('COMMIT');

        if (attemptCount >= this.MAX_ATTEMPTS) {
          throw new Error(
            `Too many failed attempts. Account locked for ${this.LOCKOUT_DURATION_MINUTES} minutes.`
          );
        }

        throw new Error(`Invalid OTP code. ${this.MAX_ATTEMPTS - attemptCount} attempts remaining.`);
      }

      const otp = otpResult.rows[0];

      // Check if expired
      if (new Date(otp.expires_at) < new Date()) {
        await client.query('COMMIT');
        throw new Error('OTP code has expired. Please request a new one.');
      }

      // Check attempts
      if (otp.attempts >= this.MAX_ATTEMPTS) {
        await client.query('COMMIT');
        throw new Error('Maximum OTP attempts exceeded.');
      }

      // Mark as used
      await client.query('UPDATE otp_codes SET is_used = true WHERE id = $1', [otp.id]);

      // Clear any lockouts
      await client.query('DELETE FROM otp_lockouts WHERE phone_number = $1', [phoneNumber]);

      await client.query('COMMIT');

      return { success: true, otpId: otp.id };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Clean up expired OTPs and lockouts
   */
  async cleanup() {
    await pool.query('DELETE FROM otp_codes WHERE expires_at < NOW()');
    await pool.query('DELETE FROM otp_lockouts WHERE locked_until < NOW()');
  }
}

export default new OTPService();