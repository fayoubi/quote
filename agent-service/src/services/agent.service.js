import pool from '../config/database.js';
import crypto from 'crypto';

class AgentService {
  /**
   * Generate random 6-digit license number
   */
  generateLicenseNumber() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Validate phone number format and country code
   */
  validatePhoneNumber(phoneNumber, countryCode) {
    const validCountryCodes = ['+212', '+33']; // Morocco and France

    if (!validCountryCodes.includes(countryCode)) {
      throw new Error('Only Morocco (+212) and France (+33) phone numbers are supported');
    }

    // Remove any spaces or dashes
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');

    // Morocco: 9 digits (after country code)
    // France: 9 digits (after country code)
    if (cleanPhone.length < 9 || cleanPhone.length > 12) {
      throw new Error('Invalid phone number format');
    }

    return cleanPhone;
  }

  /**
   * Register new agent
   */
  async register(agentData) {
    const {  phone_number, country_code, first_name, last_name, email } = agentData;

    // Validate phone number
    const validatedPhone = this.validatePhoneNumber(phone_number, country_code);

    // Check if agent already exists
    const existingQuery = `
      SELECT * FROM agents
      WHERE phone_number = $1 OR email = $2
    `;
    const existingResult = await pool.query(existingQuery, [validatedPhone, email]);

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.phone_number === validatedPhone) {
        throw new Error('Phone number already registered');
      }
      if (existing.email === email) {
        throw new Error('Email already registered');
      }
    }

    // Generate unique license number
    let licenseNumber;
    let isUnique = false;
    while (!isUnique) {
      licenseNumber = this.generateLicenseNumber();
      const checkQuery = 'SELECT id FROM agents WHERE license_number = $1';
      const checkResult = await pool.query(checkQuery, [licenseNumber]);
      isUnique = checkResult.rows.length === 0;
    }

    // Insert new agent
    const insertQuery = `
      INSERT INTO agents (phone_number, country_code, first_name, last_name, email, license_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      validatedPhone,
      country_code,
      first_name,
      last_name,
      email,
      licenseNumber,
    ]);

    return result.rows[0];
  }

  /**
   * Get agent by phone number
   */
  async getByPhoneNumber(phoneNumber) {
    const query = 'SELECT * FROM agents WHERE phone_number = $1';
    const result = await pool.query(query, [phoneNumber]);
    return result.rows[0] || null;
  }

  /**
   * Get agent by ID
   */
  async getById(agentId) {
    const query = 'SELECT * FROM agents WHERE id = $1';
    const result = await pool.query(query, [agentId]);
    return result.rows[0] || null;
  }

  /**
   * Get agent by email
   */
  async getByEmail(email) {
    const query = 'SELECT * FROM agents WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Update agent profile
   */
  async updateProfile(agentId, updates) {
    const allowedFields = ['first_name', 'last_name', 'email'];
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Check if email is being changed and if it's already taken
    if (updates.email) {
      const existingQuery = 'SELECT id FROM agents WHERE email = $1 AND id != $2';
      const existingResult = await pool.query(existingQuery, [updates.email, agentId]);
      if (existingResult.rows.length > 0) {
        throw new Error('Email already in use');
      }
    }

    values.push(agentId);
    const query = `
      UPDATE agents
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Agent not found');
    }

    return result.rows[0];
  }

  /**
   * Update agent status
   */
  async updateStatus(agentId, status) {
    const validStatuses = ['active', 'inactive', 'suspended'];

    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const query = `
      UPDATE agents
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, agentId]);

    if (result.rows.length === 0) {
      throw new Error('Agent not found');
    }

    return result.rows[0];
  }
}

export default new AgentService();