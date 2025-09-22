import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.ENABLE_TERM_LIFE = 'true';
process.env.ENABLE_WHOLE_LIFE = 'false';
process.env.ENABLE_ANNUITIES = 'false';

// Mock Redis and Database connections for tests
jest.mock('../src/services/RedisService', () => ({
  RedisService: jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue(undefined),
    cacheQuote: jest.fn().mockResolvedValue(undefined),
    getQuote: jest.fn().mockResolvedValue(null),
    cacheRateTable: jest.fn().mockResolvedValue(undefined),
    getRateTable: jest.fn().mockResolvedValue(null),
    close: jest.fn().mockResolvedValue(undefined)
  }))
}));

jest.mock('../src/services/DatabaseService', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({
    healthCheck: jest.fn().mockResolvedValue(undefined),
    getProducts: jest.fn().mockResolvedValue([]),
    getProduct: jest.fn().mockResolvedValue(null),
    saveQuote: jest.fn().mockResolvedValue(undefined),
    getQuote: jest.fn().mockResolvedValue(null),
    close: jest.fn().mockResolvedValue(undefined)
  }))
}));

// Global test timeout
jest.setTimeout(10000);