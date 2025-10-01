import pool from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';

class EnrollmentService {
  async create(enrollmentData, agentId) {
    const { customer_id, plan_id, effective_date, metadata } = enrollmentData;

    const query = `
      INSERT INTO enrollments (customer_id, agent_id, plan_id, effective_date, status, metadata, expires_at)
      VALUES ($1, $2, $3, $4, 'draft', $5, NOW() + INTERVAL '14 days')
      RETURNING *
    `;

    const result = await pool.query(query, [
      customer_id,
      agentId,
      plan_id,
      effective_date || null,
      JSON.stringify(metadata || {}),
    ]);

    return result.rows[0];
  }

  async getById(enrollmentId) {
    const query = 'SELECT * FROM enrollments WHERE id = $1';
    const result = await pool.query(query, [enrollmentId]);
    return result.rows[0] || null;
  }

  async list(filters = {}) {
    const { agentId, status, customerId, limit = 50, offset = 0 } = filters;

    let query = 'SELECT * FROM enrollments WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (agentId) {
      query += ` AND agent_id = $${paramIndex}`;
      params.push(agentId);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (customerId) {
      query += ` AND customer_id = $${paramIndex}`;
      params.push(customerId);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  async updateStatus(enrollmentId, newStatus, agentId, metadata = {}) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get current enrollment
      const currentQuery = 'SELECT * FROM enrollments WHERE id = $1';
      const currentResult = await client.query(currentQuery, [enrollmentId]);

      if (currentResult.rows.length === 0) {
        throw new ApiError(404, 'Enrollment not found');
      }

      const currentEnrollment = currentResult.rows[0];
      const previousStatus = currentEnrollment.status;

      // Update enrollment status
      const updateQuery = `
        UPDATE enrollments
        SET status = $1, updated_at = CURRENT_TIMESTAMP,
            submitted_at = CASE WHEN $1 = 'submitted' THEN CURRENT_TIMESTAMP ELSE submitted_at END,
            completed_at = CASE WHEN $1 IN ('approved', 'rejected') THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE id = $2
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [newStatus, enrollmentId]);

      // Create audit log entry
      const auditQuery = `
        INSERT INTO enrollment_audit_log (enrollment_id, agent_id, action, previous_status, new_status, changes, ip_address, user_agent)
        VALUES ($1, $2, 'status_change', $3, $4, $5, $6, $7)
      `;

      await client.query(auditQuery, [
        enrollmentId,
        agentId,
        previousStatus,
        newStatus,
        JSON.stringify(metadata),
        metadata.ip_address || null,
        metadata.user_agent || null,
      ]);

      await client.query('COMMIT');

      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(enrollmentId, agentId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if enrollment exists
      const checkQuery = 'SELECT * FROM enrollments WHERE id = $1';
      const checkResult = await client.query(checkQuery, [enrollmentId]);

      if (checkResult.rows.length === 0) {
        throw new ApiError(404, 'Enrollment not found');
      }

      const enrollment = checkResult.rows[0];

      // Only allow cancellation of draft or in_progress enrollments
      if (!['draft', 'in_progress'].includes(enrollment.status)) {
        throw new ApiError(400, `Cannot cancel enrollment with status: ${enrollment.status}`);
      }

      // Update status to cancelled instead of deleting
      const updateQuery = `
        UPDATE enrollments
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(updateQuery, [enrollmentId]);

      // Create audit log entry
      const auditQuery = `
        INSERT INTO enrollment_audit_log (enrollment_id, agent_id, action, previous_status, new_status)
        VALUES ($1, $2, 'cancelled', $3, 'cancelled')
      `;

      await client.query(auditQuery, [enrollmentId, agentId, enrollment.status]);

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getSummary(enrollmentId) {
    const client = await pool.connect();

    try {
      // Get enrollment with customer info
      const enrollmentQuery = `
        SELECT e.*, c.first_name, c.last_name, c.email, c.phone, c.address as customer_address
        FROM enrollments e
        JOIN customers c ON e.customer_id = c.id
        WHERE e.id = $1
      `;
      const enrollmentResult = await client.query(enrollmentQuery, [enrollmentId]);

      if (enrollmentResult.rows.length === 0) {
        throw new ApiError(404, 'Enrollment not found');
      }

      const enrollment = enrollmentResult.rows[0];

      // Get billing data
      const billingQuery = 'SELECT * FROM billing_data WHERE enrollment_id = $1';
      const billingResult = await client.query(billingQuery, [enrollmentId]);

      // Get beneficiaries
      const beneficiariesQuery = 'SELECT * FROM beneficiaries WHERE enrollment_id = $1 ORDER BY display_order';
      const beneficiariesResult = await client.query(beneficiariesQuery, [enrollmentId]);

      // Get step data
      const stepDataQuery = 'SELECT * FROM enrollment_step_data WHERE enrollment_id = $1';
      const stepDataResult = await client.query(stepDataQuery, [enrollmentId]);

      return {
        enrollment,
        billing: billingResult.rows[0] || null,
        beneficiaries: beneficiariesResult.rows,
        steps: stepDataResult.rows,
      };
    } finally {
      client.release();
    }
  }

  async submit(enrollmentId, agentId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get enrollment
      const enrollment = await this.getById(enrollmentId);

      if (!enrollment) {
        throw new ApiError(404, 'Enrollment not found');
      }

      if (enrollment.status !== 'in_progress') {
        throw new ApiError(400, 'Only in_progress enrollments can be submitted');
      }

      // Check if minimum required steps are completed
      const requiredSteps = ['customer_info', 'billing', 'beneficiaries'];
      const completedSteps = enrollment.completed_steps || [];

      const missingSteps = requiredSteps.filter((step) => !completedSteps.includes(step));

      if (missingSteps.length > 0) {
        throw new ApiError(400, `Missing required steps: ${missingSteps.join(', ')}`);
      }

      // Update status to submitted
      const result = await this.updateStatus(enrollmentId, 'submitted', agentId, {});

      await client.query('COMMIT');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new EnrollmentService();