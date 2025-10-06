import pool from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Enrollment Service V2 - JSONB-based, No Status, Always Editable
 *
 * This service implements Option B:
 * - All enrollment data stored in JSONB column
 * - No status tracking
 * - No step_data table
 * - Data always saved and always editable
 */
class EnrollmentServiceV2 {
  /**
   * Create a new enrollment
   * @param {string} agentId - UUID of the agent creating the enrollment
   * @returns {Object} The created enrollment
   */
  async create(agentId) {
    const query = `
      INSERT INTO enrollments (agent_id, data)
      VALUES ($1, '{}'::jsonb)
      RETURNING id, agent_id, customer_id, data, created_at, updated_at
    `;

    const result = await pool.query(query, [agentId]);
    return result.rows[0];
  }

  /**
   * Get enrollment by ID with customer info
   * @param {string} enrollmentId - UUID of the enrollment
   * @returns {Object|null} The enrollment with customer data
   */
  async getById(enrollmentId) {
    const query = `
      SELECT
        e.id,
        e.agent_id,
        e.customer_id,
        e.data,
        e.created_at,
        e.updated_at,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.cin as customer_cin,
        c.date_of_birth as customer_date_of_birth,
        c.address as customer_address,
        c.city as customer_city
      FROM enrollments e
      LEFT JOIN customers c ON e.customer_id = c.id
      WHERE e.id = $1 AND e.deleted_at IS NULL
    `;

    const result = await pool.query(query, [enrollmentId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Build response with customer object
    return {
      id: row.id,
      agent_id: row.agent_id,
      customer_id: row.customer_id,
      data: row.data,
      created_at: row.created_at,
      updated_at: row.updated_at,
      customer: row.customer_first_name ? {
        first_name: row.customer_first_name,
        last_name: row.customer_last_name,
        email: row.customer_email,
        phone: row.customer_phone,
        cin: row.customer_cin,
        date_of_birth: row.customer_date_of_birth,
        address: row.customer_address,
        city: row.customer_city
      } : null
    };
  }

  /**
   * List enrollments for an agent
   * @param {string} agentId - UUID of the agent
   * @param {number} limit - Max number of results
   * @param {number} offset - Offset for pagination
   * @returns {Array} Array of enrollments
   */
  async list(agentId, limit = 50, offset = 0) {
    const query = `
      SELECT
        e.id,
        e.agent_id,
        e.customer_id,
        e.data,
        e.created_at,
        e.updated_at,
        c.first_name || ' ' || c.last_name as customer_name,
        COALESCE(
          c.first_name,
          e.data->'personalInfo'->'subscriber'->>'firstName'
        ) || ' ' || COALESCE(
          c.last_name,
          e.data->'personalInfo'->'subscriber'->>'lastName'
        ) as full_customer_name
      FROM enrollments e
      LEFT JOIN customers c ON e.customer_id = c.id
      WHERE e.agent_id = $1 AND e.deleted_at IS NULL
      ORDER BY e.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [agentId, limit, offset]);

    return result.rows.map(row => ({
      id: row.id,
      agent_id: row.agent_id,
      customer_id: row.customer_id,
      customer_name: row.full_customer_name || 'Unnamed Customer',
      data: row.data,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  /**
   * Update enrollment data (always allowed, no status check)
   * @param {string} enrollmentId - UUID of the enrollment
   * @param {Object} enrollmentData - New data to merge into enrollment.data
   * @returns {Object} The updated enrollment
   */
  async update(enrollmentId, enrollmentData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get current enrollment
      const getCurrentQuery = 'SELECT data, customer_id FROM enrollments WHERE id = $1 AND deleted_at IS NULL';
      const currentResult = await client.query(getCurrentQuery, [enrollmentId]);

      if (currentResult.rows.length === 0) {
        throw new ApiError(404, 'Enrollment not found');
      }

      const currentData = currentResult.rows[0].data || {};
      const currentCustomerId = currentResult.rows[0].customer_id;

      // Merge new data with existing data
      const mergedData = {
        ...currentData,
        ...enrollmentData
      };

      // If personalInfo.subscriber exists, create or update customer record
      let customerId = currentCustomerId;

      if (enrollmentData.personalInfo?.subscriber) {
        const subscriber = enrollmentData.personalInfo.subscriber;

        if (customerId) {
          // Update existing customer
          const updateCustomerQuery = `
            UPDATE customers
            SET
              first_name = $1,
              last_name = $2,
              date_of_birth = $3,
              cin = $4,
              email = $5,
              phone = $6,
              address = $7,
              city = $8,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
          `;

          await client.query(updateCustomerQuery, [
            subscriber.firstName || '',
            subscriber.lastName || '',
            subscriber.dateOfBirth || null,
            subscriber.cin || null,
            subscriber.email || null,
            subscriber.phone || null,
            subscriber.address || null,
            subscriber.city || null,
            customerId
          ]);
        } else {
          // Create new customer
          const createCustomerQuery = `
            INSERT INTO customers (first_name, last_name, date_of_birth, cin, email, phone, address, city)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `;

          const customerResult = await client.query(createCustomerQuery, [
            subscriber.firstName || '',
            subscriber.lastName || '',
            subscriber.dateOfBirth || null,
            subscriber.cin || null,
            subscriber.email || null,
            subscriber.phone || null,
            subscriber.address || null,
            subscriber.city || null
          ]);

          customerId = customerResult.rows[0].id;
        }
      }

      // Update enrollment
      const updateEnrollmentQuery = `
        UPDATE enrollments
        SET
          data = $1,
          customer_id = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, agent_id, customer_id, data, created_at, updated_at
      `;

      const result = await client.query(updateEnrollmentQuery, [
        JSON.stringify(mergedData),
        customerId,
        enrollmentId
      ]);

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Soft delete enrollment
   * @param {string} enrollmentId - UUID of the enrollment
   * @returns {Object} The deleted enrollment
   */
  async delete(enrollmentId) {
    const query = `
      UPDATE enrollments
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await pool.query(query, [enrollmentId]);

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Enrollment not found');
    }

    return result.rows[0];
  }
}

export default new EnrollmentServiceV2();
