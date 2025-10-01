import pool from '../config/database.js';
import encryptionService from './encryption.service.js';
import { ApiError } from '../middleware/errorHandler.js';

class BillingService {
  async save(enrollmentId, billingData) {
    const {
      contribution_amount,
      contribution_frequency,
      payment_method_type,
      payment_method_last_four,
      payment_method_expiry,
      payment_method_data,
      effective_date,
    } = billingData;

    // Encrypt sensitive payment data
    const { encrypted, keyId } = encryptionService.encrypt(payment_method_data);

    // Check if billing data already exists
    const existingQuery = 'SELECT * FROM billing_data WHERE enrollment_id = $1';
    const existingResult = await pool.query(existingQuery, [enrollmentId]);

    if (existingResult.rows.length > 0) {
      // Update existing billing data
      const updateQuery = `
        UPDATE billing_data
        SET contribution_amount = $1, contribution_frequency = $2, payment_method_type = $3,
            payment_method_last_four = $4, payment_method_expiry = $5,
            encrypted_payment_data = $6, encryption_key_id = $7, effective_date = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE enrollment_id = $9
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [
        contribution_amount,
        contribution_frequency,
        payment_method_type,
        payment_method_last_four || null,
        payment_method_expiry || null,
        encrypted,
        keyId,
        effective_date,
        enrollmentId,
      ]);

      return result.rows[0];
    }

    // Insert new billing data
    const insertQuery = `
      INSERT INTO billing_data (enrollment_id, contribution_amount, contribution_frequency,
                                payment_method_type, payment_method_last_four, payment_method_expiry,
                                encrypted_payment_data, encryption_key_id, effective_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      enrollmentId,
      contribution_amount,
      contribution_frequency,
      payment_method_type,
      payment_method_last_four || null,
      payment_method_expiry || null,
      encrypted,
      keyId,
      effective_date,
    ]);

    return result.rows[0];
  }

  async get(enrollmentId, maskData = true) {
    const query = 'SELECT * FROM billing_data WHERE enrollment_id = $1';
    const result = await pool.query(query, [enrollmentId]);

    if (result.rows.length === 0) {
      return null;
    }

    const billingData = result.rows[0];

    if (!maskData && billingData.encrypted_payment_data) {
      // Decrypt payment data if not masking
      try {
        const decrypted = encryptionService.decrypt(
          billingData.encrypted_payment_data,
          billingData.encryption_key_id
        );
        billingData.payment_method_data = decrypted;
      } catch (error) {
        console.error('Error decrypting payment data:', error);
      }
    }

    // Remove encrypted field from response
    delete billingData.encrypted_payment_data;

    return billingData;
  }

  async delete(enrollmentId) {
    const query = 'DELETE FROM billing_data WHERE enrollment_id = $1 RETURNING *';
    const result = await pool.query(query, [enrollmentId]);

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Billing data not found');
    }

    return result.rows[0];
  }
}

export default new BillingService();