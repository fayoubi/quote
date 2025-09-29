import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { featureFlagService } from './services/FeatureFlagService.js';
import { MetricsService } from './services/MetricsService.js';

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pricing Service API',
      version: '1.0.0',
      description: 'Multi-Product Insurance Pricing Microservice',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize metrics if enabled
let metricsService: MetricsService | undefined;
if (featureFlagService.isEnabled('metrics_collection')) {
  metricsService = new MetricsService();

  // Add metrics middleware
  app.use(metricsService.requestDurationMiddleware());

  // Metrics endpoint
  app.get('/api/v1/metrics', async (_req, res) => {
    try {
      const metrics = await metricsService!.getMetrics();
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    } catch (error) {
      res.status(500).send('Error generating metrics');
    }
  });
}

// API routes
app.use('/', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'Pricing Service',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    features: featureFlagService.getEnabledProducts(),
    documentation: '/api/docs'
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Validate feature flag configuration
    const validation = featureFlagService.validateConfiguration();
    if (!validation.isValid) {
      console.error('Feature flag configuration errors:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    const server = app.listen(config.port, () => {
      console.log(`🚀 Pricing Service started on port ${config.port}`);
      console.log(`📖 API Documentation: http://localhost:${config.port}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/api/v1/health`);

      if (metricsService) {
        console.log(`📊 Metrics: http://localhost:${config.port}/api/v1/metrics`);
      }

      const enabledProducts = featureFlagService.getEnabledProducts();
      console.log(`✅ Enabled products: ${enabledProducts.join(', ')}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${config.port} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;