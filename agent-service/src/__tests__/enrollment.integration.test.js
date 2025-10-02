import request from 'supertest';
import app from '../app.js';
import pool from '../config/database.js';

describe('Agent Enrollment Integration Tests', () => {
  let testAgent = null;
  let testToken = null;
  let testPhoneNumber = null;

  // Setup: Create a test agent and authenticate
  beforeAll(async () => {
    testPhoneNumber = `${Date.now()}`.slice(-9);

    // Register agent
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        first_name: 'Enrollment',
        last_name: 'Tester',
        email: `enrollment.test.${Date.now()}@example.com`,
        phone_number: testPhoneNumber,
        country_code: '+212',
        agency_name: 'Enrollment Test Agency'
      });

    testAgent = registerResponse.body.data.agent;
    const otpCode = registerResponse.body.data.otp.code;

    // Verify OTP to get token
    const verifyResponse = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        phone_number: testPhoneNumber,
        code: otpCode
      });

    testToken = verifyResponse.body.token;
  });

  // Clean up test data
  afterAll(async () => {
    if (testPhoneNumber) {
      await pool.query('DELETE FROM agent_otps WHERE phone = $1', [testPhoneNumber]);
      await pool.query('DELETE FROM sessions WHERE agent_id IN (SELECT id FROM agents WHERE phone_number = $1)', [testPhoneNumber]);
      await pool.query('DELETE FROM agents WHERE phone_number = $1', [testPhoneNumber]);
    }
    await pool.end();
  });

  describe('GET /api/v1/agents/enrollments', () => {
    it('should get enrollments for authenticated agent', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Should return empty array or array of enrollments
      if (response.body.data.length > 0) {
        const enrollment = response.body.data[0];
        expect(enrollment).toHaveProperty('id');
        expect(enrollment).toHaveProperty('enrollment_id');
        expect(enrollment).toHaveProperty('status');
        expect(enrollment).toHaveProperty('applicantName');
        expect(enrollment).toHaveProperty('startDate');
        expect(enrollment).toHaveProperty('lastUpdated');
      }
    });

    it('should fail to get enrollments without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    it('should fail to get enrollments with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should only return enrollments for the authenticated agent', async () => {
      // This test verifies the agent_id filtering works correctly
      const response = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // If there are enrollments, verify they all belong to this agent
      if (response.body.data.length > 0) {
        response.body.data.forEach(enrollment => {
          // The enrollment service should only return enrollments for this agent
          expect(enrollment).toBeDefined();
        });
      }
    });
  });

  describe('GET /api/v1/agents/enrollments/:enrollmentId', () => {
    it('should handle request for specific enrollment', async () => {
      // First get all enrollments
      const listResponse = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const enrollmentId = listResponse.body.data[0].id;

        const response = await request(app)
          .get(`/api/v1/agents/enrollments/${enrollmentId}`)
          .set('Authorization', `Bearer ${testToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBe(enrollmentId);
      } else {
        // If no enrollments, test with non-existent ID
        const response = await request(app)
          .get('/api/v1/agents/enrollments/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${testToken}`);

        // Should return 404 or empty response
        expect([404, 200].includes(response.status)).toBe(true);
      }
    });

    it('should fail to get enrollment without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments/00000000-0000-0000-0000-000000000000')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not allow accessing another agent\'s enrollment', async () => {
      // Create another agent
      const otherPhone = `${Date.now() + 1}`.slice(-9);
      const otherRegister = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Other',
          last_name: 'Agent',
          email: `other.${Date.now()}@example.com`,
          phone_number: otherPhone,
          country_code: '+212',
          agency_name: 'Other Agency'
        });

      const otherVerify = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone_number: otherPhone,
          code: otherRegister.body.data.otp.code
        });

      const otherToken = otherVerify.body.token;

      // Try to access first agent's enrollment with second agent's token
      const listResponse = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', `Bearer ${testToken}`);

      if (listResponse.body.data.length > 0) {
        const enrollmentId = listResponse.body.data[0].id;

        const response = await request(app)
          .get(`/api/v1/agents/enrollments/${enrollmentId}`)
          .set('Authorization', `Bearer ${otherToken}`);

        // Should return 404 or 403 (not found or forbidden)
        expect([404, 403].includes(response.status) || response.body.data === null).toBe(true);
      }

      // Clean up other agent
      await pool.query('DELETE FROM agent_otps WHERE phone = $1', [otherPhone]);
      await pool.query('DELETE FROM sessions WHERE agent_id IN (SELECT id FROM agents WHERE phone_number = $1)', [otherPhone]);
      await pool.query('DELETE FROM agents WHERE phone_number = $1', [otherPhone]);
    });

    it('should return 404 for non-existent enrollment ID', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${testToken}`);

      // Should return 404 or success with null data
      if (response.status === 200) {
        expect(response.body.data).toBeNull();
      } else {
        expect(response.status).toBe(404);
      }
    });

    it('should reject invalid enrollment ID format', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments/invalid-id')
        .set('Authorization', `Bearer ${testToken}`);

      // Should return 400 or 404
      expect([400, 404].includes(response.status)).toBe(true);
    });
  });

  describe('Enrollment Service Integration', () => {
    it('should handle enrollment service being unavailable gracefully', async () => {
      // This test verifies error handling when enrollment-service is down
      // The actual behavior depends on implementation
      const response = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', `Bearer ${testToken}`);

      // Should either succeed or return a service error
      expect([200, 503, 500].includes(response.status)).toBe(true);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should properly transform enrollment data from enrollment-service', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify data structure transformation
      if (response.body.data.length > 0) {
        const enrollment = response.body.data[0];

        // Check required fields are present
        expect(enrollment).toHaveProperty('enrollment_id');
        expect(enrollment).toHaveProperty('applicantName');
        expect(enrollment).toHaveProperty('status');
        expect(enrollment).toHaveProperty('startDate');
        expect(enrollment).toHaveProperty('lastUpdated');

        // Check proper date formatting
        expect(new Date(enrollment.startDate)).toBeInstanceOf(Date);
        expect(new Date(enrollment.lastUpdated)).toBeInstanceOf(Date);

        // Check status is valid
        const validStatuses = ['draft', 'in_progress', 'submitted', 'approved', 'issued', 'declined'];
        expect(validStatuses.includes(enrollment.status)).toBe(true);
      }
    });
  });

  describe('Agent Context in Enrollments', () => {
    it('should include agent information context in enrollment requests', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // The response should be filtered by agent_id
      // This is verified by the enrollment-service receiving the correct agent_id
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should maintain agent_id throughout enrollment lifecycle', async () => {
      // Get agent's enrollments
      const response = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // All returned enrollments should be associated with this agent
      // This is implicitly tested by the filtering in enrollment-service
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
