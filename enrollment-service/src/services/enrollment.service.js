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
    const query = `
      SELECT
        e.*,
        c.first_name,
        c.last_name,
        c.middle_name,
        c.email,
        c.phone,
        c.cin,
        c.date_of_birth,
        c.address as customer_address
      FROM enrollments e
      LEFT JOIN customers c ON e.customer_id = c.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [enrollmentId]);
    const row = result.rows[0];

    if (!row) return null;

    // Parse JSON fields if they're strings
    if (typeof row.completed_steps === 'string') {
      try {
        row.completed_steps = JSON.parse(row.completed_steps);
      } catch (e) {
        row.completed_steps = [];
      }
    }

    if (typeof row.metadata === 'string') {
      try {
        row.metadata = JSON.parse(row.metadata);
      } catch (e) {
        row.metadata = {};
      }
    }

    // Build enrollment object with customer data
    const enrollment = {
      id: row.id,
      customer_id: row.customer_id,
      agent_id: row.agent_id,
      plan_id: row.plan_id,
      status: row.status,
      effective_date: row.effective_date,
      current_step: row.current_step,
      completed_steps: row.completed_steps,
      session_data: row.session_data,
      metadata: row.metadata,
      created_at: row.created_at,
      updated_at: row.updated_at,
      submitted_at: row.submitted_at,
      completed_at: row.completed_at,
      expires_at: row.expires_at,
      customer: row.first_name ? {
        first_name: row.first_name,
        last_name: row.last_name,
        middle_name: row.middle_name,
        email: row.email,
        phone: row.phone,
        cin: row.cin,
        date_of_birth: row.date_of_birth,
        address: row.customer_address
      } : null
    };

    return enrollment;
  }

  async list(filters = {}) {
    const { agentId, status, customerId, limit = 50, offset = 0 } = filters;

    let query = `
      SELECT
        e.*,
        c.first_name,
        c.last_name,
        c.middle_name,
        c.email,
        c.phone,
        c.cin,
        c.date_of_birth,
        c.address as customer_address
      FROM enrollments e
      LEFT JOIN customers c ON e.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (agentId) {
      query += ` AND e.agent_id = $${paramIndex}`;
      params.push(agentId);
      paramIndex++;
    }

    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (customerId) {
      query += ` AND e.customer_id = $${paramIndex}`;
      params.push(customerId);
      paramIndex++;
    }

    query += ` ORDER BY e.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Transform rows to include customer object
    return result.rows.map(row => ({
      id: row.id,
      customer_id: row.customer_id,
      agent_id: row.agent_id,
      plan_id: row.plan_id,
      status: row.status,
      effective_date: row.effective_date,
      current_step: row.current_step,
      completed_steps: row.completed_steps,
      session_data: row.session_data,
      metadata: row.metadata,
      created_at: row.created_at,
      updated_at: row.updated_at,
      submitted_at: row.submitted_at,
      completed_at: row.completed_at,
      expires_at: row.expires_at,
      customer: row.first_name ? {
        first_name: row.first_name,
        last_name: row.last_name,
        middle_name: row.middle_name,
        email: row.email,
        phone: row.phone,
        cin: row.cin,
        date_of_birth: row.date_of_birth,
        address: row.customer_address
      } : null
    }));
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
        SET status = $1::varchar, updated_at = CURRENT_TIMESTAMP,
            submitted_at = CASE WHEN $1::varchar = 'submitted' THEN CURRENT_TIMESTAMP ELSE submitted_at END,
            completed_at = CASE WHEN $1::varchar IN ('approved', 'rejected') THEN CURRENT_TIMESTAMP ELSE completed_at END
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
      // Get enrollment with customer info using getById
      const enrollment = await this.getById(enrollmentId);

      if (!enrollment) {
        throw new ApiError(404, 'Enrollment not found');
      }

      // Get billing data
      const billingQuery = 'SELECT * FROM billing_data WHERE enrollment_id = $1';
      const billingResult = await client.query(billingQuery, [enrollmentId]);

      // Get beneficiaries
      const beneficiariesQuery = 'SELECT * FROM beneficiaries WHERE enrollment_id = $1 ORDER BY display_order';
      const beneficiariesResult = await client.query(beneficiariesQuery, [enrollmentId]);

      // Get step data
      const stepDataQuery = 'SELECT * FROM enrollment_step_data WHERE enrollment_id = $1 ORDER BY created_at';
      const stepDataResult = await client.query(stepDataQuery, [enrollmentId]);

      // Parse step data JSON
      const steps = stepDataResult.rows.map(row => ({
        ...row,
        step_data: typeof row.step_data === 'string' ? JSON.parse(row.step_data) : row.step_data
      }));

      return {
        enrollment,
        billing: billingResult.rows[0] || null,
        beneficiaries: beneficiariesResult.rows,
        steps,
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

      // No status check - allow submission from any status for MVP

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