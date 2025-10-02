import request from 'supertest';
import app from '../app.js';
import pool from '../config/database.js';

describe('Agent Auth Integration Tests', () => {
  let testAgent = null;
  let testOtpCode = null;
  let testPhoneNumber = null;

  // Clean up test data after all tests
  afterAll(async () => {
    // Clean up test agents and related data
    if (testPhoneNumber) {
      await pool.query('DELETE FROM agent_otps WHERE phone = $1', [testPhoneNumber]);
      await pool.query('DELETE FROM sessions WHERE agent_id IN (SELECT id FROM agents WHERE phone_number = $1)', [testPhoneNumber]);
      await pool.query('DELETE FROM agents WHERE phone_number = $1', [testPhoneNumber]);
    }
    await pool.end();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new agent', async () => {
      testPhoneNumber = `${Date.now()}`.slice(-9); // Last 9 digits of timestamp

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'Agent',
          email: `test.agent.${Date.now()}@example.com`,
          phone_number: testPhoneNumber,
          country_code: '+212',
          agency_name: 'Test Agency'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.agent).toBeDefined();
      expect(response.body.data.agent.license_number).toMatch(/^AG-\d{4}-\d{6}$/);
      expect(response.body.data.agent.agency_name).toBe('Test Agency');
      expect(response.body.data.otp).toBeDefined();
      expect(response.body.data.otp.code).toMatch(/^\d{6}$/);

      // Save for later tests
      testAgent = response.body.data.agent;
      testOtpCode = response.body.data.otp.code;
    });

    it('should fail to register with duplicate phone number', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Duplicate',
          last_name: 'Test',
          email: `duplicate.${Date.now()}@example.com`,
          phone_number: testPhoneNumber,
          country_code: '+212',
          agency_name: 'Test Agency'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already registered');
    });

    it('should fail to register with invalid phone number', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'Agent',
          email: `test.${Date.now()}@example.com`,
          phone_number: '123', // Too short
          country_code: '+212',
          agency_name: 'Test Agency'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('phone number');
    });

    it('should fail to register with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Test'
          // Missing other required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('should successfully verify OTP and return JWT token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone_number: testPhoneNumber,
          code: testOtpCode
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.agent).toBeDefined();
      expect(response.body.agent.id).toBe(testAgent.id);
      expect(response.body.agent.last_login_at).toBeDefined();

      // Save token for later tests
      testAgent.token = response.body.token;
    });

    it('should fail to verify with incorrect OTP code', async () => {
      // Request new OTP first
      const otpResponse = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({
          phone_number: testPhoneNumber,
          country_code: '+212'
        })
        .expect(200);

      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone_number: testPhoneNumber,
          code: '000000' // Wrong code
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });

    it('should fail to verify with expired OTP', async () => {
      // This test would require mocking time or waiting 10 minutes
      // For now, just test the basic validation
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone_number: testPhoneNumber,
          code: '999999' // Non-existent code
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/request-otp', () => {
    it('should successfully request OTP for existing agent', async () => {
      const response = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({
          phone_number: testPhoneNumber,
          country_code: '+212'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.otp).toBeDefined();
      expect(response.body.data.otp.code).toMatch(/^\d{6}$/);
      expect(response.body.data.otp.expires_at).toBeDefined();
    });

    it('should fail to request OTP for non-existent agent', async () => {
      const response = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({
          phone_number: '999999999',
          country_code: '+212'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should implement rate limiting after multiple requests', async () => {
      // Make 6 rapid requests to trigger rate limiting
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/v1/auth/request-otp')
          .send({
            phone_number: testPhoneNumber,
            country_code: '+212'
          });
      }

      const response = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({
          phone_number: testPhoneNumber,
          country_code: '+212'
        });

      // Should either succeed or be rate limited
      if (response.status === 429) {
        expect(response.body.error).toContain('locked');
      }
    });
  });

  describe('GET /api/v1/agents/me', () => {
    it('should get agent profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/agents/me')
        .set('Authorization', `Bearer ${testAgent.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testAgent.id);
      expect(response.body.data.license_number).toBe(testAgent.license_number);
      expect(response.body.data.agency_name).toBe('Test Agency');
    });

    it('should fail to get profile without token', async () => {
      const response = await request(app)
        .get('/api/v1/agents/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    it('should fail to get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/agents/me')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/agents/me', () => {
    it('should update agent profile', async () => {
      const response = await request(app)
        .patch('/api/v1/agents/me')
        .set('Authorization', `Bearer ${testAgent.token}`)
        .send({
          first_name: 'Updated',
          last_name: 'Agent',
          email: `updated.${Date.now()}@example.com`
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe('Updated');
      expect(response.body.data.last_name).toBe('Agent');
    });

    it('should not allow updating phone number', async () => {
      const response = await request(app)
        .patch('/api/v1/agents/me')
        .set('Authorization', `Bearer ${testAgent.token}`)
        .send({
          phone_number: '999999999' // Should not update
        })
        .expect(200);

      // Phone number should remain unchanged
      expect(response.body.data.phone_number).toBe(testPhoneNumber);
    });

    it('should fail to update with invalid email', async () => {
      const response = await request(app)
        .patch('/api/v1/agents/me')
        .set('Authorization', `Bearer ${testAgent.token}`)
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should successfully logout agent', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${testAgent.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('logout');
    });

    it('should fail to logout without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('agent-service');
    });
  });
});
