import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'pricing_service',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },

  // Feature flags
  features: {
    enableTermLife: process.env.ENABLE_TERM_LIFE === 'true',
    enableWholeLife: process.env.ENABLE_WHOLE_LIFE === 'true',
    enableAnnuities: process.env.ENABLE_ANNUITIES === 'true',
  },

  // Application settings
  app: {
    defaultProductType: process.env.DEFAULT_PRODUCT_TYPE || 'term_life',
    quoteExpiryHours: parseInt(process.env.QUOTE_EXPIRY_HOURS || '720'),
    rateTableVersionTermLife: process.env.RATE_TABLE_VERSION_TERM_LIFE || 'v1.0.0',
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '1000'),
  },

  // Monitoring
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT || '9090'),
  },
};

export default config;