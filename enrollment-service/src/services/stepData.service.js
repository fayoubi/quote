import pool from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';
import { validateStepData } from '../utils/validators.js';

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

    return result.rows[0] || null;
  }

  async getAll(enrollmentId) {
    const query = 'SELECT * FROM enrollment_step_data WHERE enrollment_id = $1 ORDER BY created_at';
    const result = await pool.query(query, [enrollmentId]);

    return result.rows;
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