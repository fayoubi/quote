import pool from '../config/database.js';
import encryptionService from './encryption.service.js';
import { ApiError } from '../middleware/errorHandler.js';
import { validateBeneficiaryPercentages } from '../utils/validators.js';

class BeneficiaryService {
  async add(enrollmentId, beneficiaries) {
    // Validate percentages
    const validation = validateBeneficiaryPercentages(beneficiaries);
    if (!validation.valid) {
      throw new ApiError(
        400,
        `Invalid beneficiary percentages. Primary: ${validation.primaryTotal}%, Contingent: ${validation.contingentTotal}%`
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete existing beneficiaries for this enrollment
      await client.query('DELETE FROM beneficiaries WHERE enrollment_id = $1', [enrollmentId]);

      // Insert new beneficiaries
      const insertedBeneficiaries = [];
      for (let i = 0; i < beneficiaries.length; i++) {
        const ben = beneficiaries[i];

        // Encrypt SSN if provided
        let encryptedSsn = null;
        if (ben.ssn) {
          const { encrypted } = encryptionService.encrypt({ ssn: ben.ssn });
          encryptedSsn = encrypted;
        }

        const insertQuery = `
          INSERT INTO beneficiaries (enrollment_id, type, first_name, last_name, relationship,
                                     percentage, date_of_birth, encrypted_ssn, address, display_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;

        const result = await client.query(insertQuery, [
          enrollmentId,
          ben.type,
          ben.first_name,
          ben.last_name,
          ben.relationship,
          ben.percentage,
          ben.date_of_birth,
          encryptedSsn,
          JSON.stringify(ben.address || {}),
          ben.display_order !== undefined ? ben.display_order : i + 1,
        ]);

        insertedBeneficiaries.push(result.rows[0]);
      }

      await client.query('COMMIT');

      return insertedBeneficiaries;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async get(enrollmentId) {
    const query = 'SELECT * FROM beneficiaries WHERE enrollment_id = $1 ORDER BY display_order';
    const result = await pool.query(query, [enrollmentId]);

    // Don't decrypt SSN in list view
    return result.rows.map((ben) => {
      const { encrypted_ssn, ...rest } = ben;
      return { ...rest, has_ssn: !!encrypted_ssn };
    });
  }

  async getById(beneficiaryId) {
    const query = 'SELECT * FROM beneficiaries WHERE id = $1';
    const result = await pool.query(query, [beneficiaryId]);

    if (result.rows.length === 0) {
      return null;
    }

    const beneficiary = result.rows[0];

    // Decrypt SSN if present
    if (beneficiary.encrypted_ssn) {
      try {
        const decrypted = encryptionService.decrypt(beneficiary.encrypted_ssn, 'v1');
        beneficiary.ssn = decrypted.ssn;
      } catch (error) {
        console.error('Error decrypting SSN:', error);
      }
    }

    delete beneficiary.encrypted_ssn;

    return beneficiary;
  }

  async update(beneficiaryId, beneficiaryData) {
    const { first_name, last_name, relationship, percentage, date_of_birth, address, ssn } = beneficiaryData;

    // Encrypt SSN if provided
    let encryptedSsn = null;
    if (ssn) {
      const { encrypted } = encryptionService.encrypt({ ssn });
      encryptedSsn = encrypted;
    }

    const query = `
      UPDATE beneficiaries
      SET first_name = $1, last_name = $2, relationship = $3, percentage = $4,
          date_of_birth = $5, address = $6, encrypted_ssn = COALESCE($7, encrypted_ssn),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const result = await pool.query(query, [
      first_name,
      last_name,
      relationship,
      percentage,
      date_of_birth,
      JSON.stringify(address),
      encryptedSsn,
      beneficiaryId,
    ]);

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Beneficiary not found');
    }

    // Validate total percentages after update
    const enrollment_id = result.rows[0].enrollment_id;
    const allBeneficiaries = await this.get(enrollment_id);

    const validation = validateBeneficiaryPercentages(
      allBeneficiaries.map((b) => ({ type: b.type, percentage: b.percentage }))
    );

    if (!validation.valid) {
      throw new ApiError(
        400,
        `Invalid total beneficiary percentages. Primary: ${validation.primaryTotal}%, Contingent: ${validation.contingentTotal}%`
      );
    }

    return result.rows[0];
  }

  async delete(beneficiaryId) {
    const query = 'DELETE FROM beneficiaries WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [beneficiaryId]);

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Beneficiary not found');
    }

    return result.rows[0];
  }
}

export default new BeneficiaryService();