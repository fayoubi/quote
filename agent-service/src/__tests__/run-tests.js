#!/usr/bin/env node
/**
 * Manual test runner for ES modules
 * Run with: node src/__tests__/run-tests.js
 */

import request from 'supertest';
import app from '../app.js';
import pool from '../config/database.js';

// Test results tracking
let passed = 0;
let failed = 0;
const failures = [];

// Test utilities
const expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  },
  toMatch: (pattern) => {
    if (!pattern.test(actual)) {
      throw new Error(`Expected "${actual}" to match ${pattern}`);
    }
  },
  toContain: (substring) => {
    if (!String(actual).includes(substring)) {
      throw new Error(`Expected "${actual}" to contain "${substring}"`);
    }
  },
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error(`Expected value to be defined`);
    }
  },
  toHaveProperty: (prop) => {
    if (!(prop in actual)) {
      throw new Error(`Expected object to have property "${prop}"`);
    }
  }
});

const test = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed++;
    failures.push({ name, error: error.message });
    console.log(`  ✗ ${name}`);
    console.log(`    ${error.message}`);
  }
};

const describe = (suiteName, fn) => {
  console.log(`\n${suiteName}`);
  return fn();
};

// Global test state
let testAgent = null;
let testOtpCode = null;
let testPhoneNumber = null;
let testToken = null;

// Main test suite
async function runTests() {
  console.log('\n🧪 Running Agent Service Integration Tests\n');
  console.log('='.repeat(50));

  // Auth Tests
  await describe('Authentication Flow', async () => {
    await test('should register a new agent', async () => {
      testPhoneNumber = `${Date.now()}`.slice(-9);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'Agent',
          email: `test.${Date.now()}@example.com`,
          phone_number: testPhoneNumber,
          country_code: '+212',
          agency_name: 'Test Agency'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.agent).toBeDefined();
      expect(response.body.data.agent.license_number).toMatch(/^AG-\d{4}-\d{6}$/);
      expect(response.body.data.otp).toBeDefined();

      testAgent = response.body.data.agent;
      testOtpCode = response.body.data.otp.code;
    });

    await test('should fail to register with duplicate phone', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'Duplicate',
          last_name: 'Test',
          email: `duplicate.${Date.now()}@example.com`,
          phone_number: testPhoneNumber,
          country_code: '+212',
          agency_name: 'Test Agency'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    await test('should verify OTP and return token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone_number: testPhoneNumber,
          code: testOtpCode
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.agent.id).toBe(testAgent.id);

      testToken = response.body.token;
    });

    await test('should fail to verify with wrong OTP', async () => {
      // Request new OTP first
      await request(app)
        .post('/api/v1/auth/request-otp')
        .send({
          phone_number: testPhoneNumber,
          country_code: '+212'
        });

      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone_number: testPhoneNumber,
          code: '000000'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    await test('should request OTP for existing agent', async () => {
      const response = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({
          phone_number: testPhoneNumber,
          country_code: '+212'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.otp).toBeDefined();
    });
  });

  // Profile Tests
  await describe('Agent Profile Management', async () => {
    await test('should get agent profile', async () => {
      const response = await request(app)
        .get('/api/v1/agents/me')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testAgent.id);
      expect(response.body.data.agency_name).toBe('Test Agency');
    });

    await test('should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/agents/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    await test('should update agent profile', async () => {
      const response = await request(app)
        .patch('/api/v1/agents/me')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          first_name: 'Updated',
          last_name: 'Agent'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe('Updated');
    });
  });

  // Enrollment Tests
  await describe('Agent Enrollments', async () => {
    await test('should get enrollments for agent', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    await test('should fail without auth', async () => {
      const response = await request(app)
        .get('/api/v1/agents/enrollments');

      expect(response.status).toBe(401);
    });
  });

  // Health Check
  await describe('Health Check', async () => {
    await test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  // Cleanup
  console.log('\n' + '='.repeat(50));
  console.log('\n🧹 Cleaning up test data...');

  if (testPhoneNumber) {
    await pool.query('DELETE FROM agent_otps WHERE phone = $1', [testPhoneNumber]);
    await pool.query('DELETE FROM sessions WHERE agent_id IN (SELECT id FROM agents WHERE phone_number = $1)', [testPhoneNumber]);
    await pool.query('DELETE FROM agents WHERE phone_number = $1', [testPhoneNumber]);
  }

  await pool.end();

  // Results
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:');
  console.log(`  ✓ Passed: ${passed}`);
  console.log(`  ✗ Failed: ${failed}`);
  console.log(`  Total: ${passed + failed}`);

  if (failures.length > 0) {
    console.log('\n❌ Failures:');
    failures.forEach(f => {
      console.log(`  - ${f.name}`);
      console.log(`    ${f.error}`);
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test runner error:', error);
  process.exit(1);
});
