export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/__tests__/**',
    '!src/app.js'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/tests/**/*.test.js',
  ],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js']
};