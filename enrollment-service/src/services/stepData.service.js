import pool from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';
import { validateStepData } from '../utils/validators.js';
import customerService from './customer.service.js';

class StepDataService {
  async save(enrollmentId, stepId, stepData) {
    // Validate step data
    const validation = validateStepData(stepId, stepData);
    if (!validation.valid) {
      throw new ApiError(400, validation.error);
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // If this is customer_info step, update the customer record
      if (stepId === 'customer_info' && stepData.subscriber) {
        const enrollmentQuery = 'SELECT customer_id FROM enrollments WHERE id = $1';
        const enrollmentResult = await client.query(enrollmentQuery, [enrollmentId]);

        if (enrollmentResult.rows.length > 0) {
          const customerId = enrollmentResult.rows[0].customer_id;
          const subscriber = stepData.subscriber;

          // Update customer table with complete subscriber info
          const updateCustomerQuery = `
            UPDATE customers
            SET
              cin = $1,
              first_name = $2,
              last_name = $3,
              middle_name = $4,
              date_of_birth = $5,
              email = $6,
              phone = $7,
              address = $8,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
          `;

          await client.query(updateCustomerQuery, [
            subscriber.idNumber || `TEMP-${Date.now()}`,
            subscriber.firstName || '',
            subscriber.lastName || '',
            subscriber.middleName || null,
            subscriber.birthDate || '1990-01-01',
            subscriber.phone || 'temp@example.com',
            subscriber.phone || null,
            JSON.stringify({
              street: subscriber.address || '',
              city: subscriber.city || '',
              country: subscriber.country || '',
              birthPlace: subscriber.birthPlace || ''
            }),
            customerId
          ]);
        }
      }

      // Check if step data already exists
      const existingQuery = 'SELECT * FROM enrollment_step_data WHERE enrollment_id = $1 AND step_id = $2';
      const existingResult = await client.query(existingQuery, [enrollmentId, stepId]);

      let result;
      if (existingResult.rows.length > 0) {
        // Update existing step data
        const updateQuery = `
          UPDATE enrollment_step_data
          SET step_data = $1, version = version + 1, updated_at = CURRENT_TIMESTAMP
          WHERE enrollment_id = $2 AND step_id = $3
          RETURNING *
        `;
        result = await client.query(updateQuery, [JSON.stringify(stepData), enrollmentId, stepId]);
      } else {
        // Insert new step data
        const insertQuery = `
          INSERT INTO enrollment_step_data (enrollment_id, step_id, step_data)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        result = await client.query(insertQuery, [enrollmentId, stepId, JSON.stringify(stepData)]);
      }

      // Update enrollment completed_steps
      const enrollmentQuery = 'SELECT completed_steps FROM enrollments WHERE id = $1';
      const enrollmentResult = await client.query(enrollmentQuery, [enrollmentId]);

      if (enrollmentResult.rows.length > 0) {
        const completedSteps = enrollmentResult.rows[0].completed_steps || [];
        if (!completedSteps.includes(stepId)) {
          completedSteps.push(stepId);

          const updateEnrollmentQuery = `
            UPDATE enrollments
            SET completed_steps = $1, current_step = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
          `;
          await client.query(updateEnrollmentQuery, [JSON.stringify(completedSteps), stepId, enrollmentId]);
        }
      }

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async get(enrollmentId, stepId) {
    const query = 'SELECT * FROM enrollment_step_data WHERE enrollment_id = $1 AND step_id = $2';
    const result = await pool.query(query, [enrollmentId, stepId]);

    const row = result.rows[0];
    if (!row) return null;

    // Parse step_data if it's a string
    if (typeof row.step_data === 'string') {
      try {
        row.step_data = JSON.parse(row.step_data);
      } catch (e) {
        console.error('Error parsing step_data:', e);
      }
    }

    return row;
  }

  async getAll(enrollmentId) {
    const query = 'SELECT * FROM enrollment_step_data WHERE enrollment_id = $1 ORDER BY created_at';
    const result = await pool.query(query, [enrollmentId]);

    // Parse step_data for all rows
    return result.rows.map(row => ({
      ...row,
      step_data: typeof row.step_data === 'string' ? JSON.parse(row.step_data) : row.step_data
    }));
  }

  async delete(enrollmentId, stepId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete step data
      const deleteQuery = 'DELETE FROM enrollment_step_data WHERE enrollment_id = $1 AND step_id = $2 RETURNING *';
      const result = await client.query(deleteQuery, [enrollmentId, stepId]);

      if (result.rows.length === 0) {
        throw new ApiError(404, 'Step data not found');
      }

      // Update enrollment completed_steps
      const enrollmentQuery = 'SELECT completed_steps FROM enrollments WHERE id = $1';
      const enrollmentResult = await client.query(enrollmentQuery, [enrollmentId]);

      if (enrollmentResult.rows.length > 0) {
        const completedSteps = enrollmentResult.rows[0].completed_steps || [];
        const updatedSteps = completedSteps.filter((step) => step !== stepId);

        const updateEnrollmentQuery = `
          UPDATE enrollments
          SET completed_steps = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `;
        await client.query(updateEnrollmentQuery, [JSON.stringify(updatedSteps), enrollmentId]);
      }

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new StepDataService();