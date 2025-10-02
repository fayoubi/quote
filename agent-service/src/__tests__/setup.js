// Test setup file for Jest
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3003';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.ENROLLMENT_SERVICE_URL = 'http://localhost:3002';

// Override database config for tests
// Use environment variable or fall back to test database
if (!process.env.DATABASE_URL) {
  process.env.PG_HOST = 'localhost';
  process.env.PG_PORT = '5435';
  process.env.PG_DATABASE = 'agent';
  process.env.PG_USER = 'postgres';
  process.env.PG_PASSWORD = 'postgres';
}
