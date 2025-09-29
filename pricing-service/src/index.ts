import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { featureFlagService } from './services/FeatureFlagService.js';
import { MetricsService } from './services/MetricsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Custom yadmanx documentation page
app.get('/api/docs/', (_req, res) => {
  try {
    const docsPath = path.join(__dirname, 'docs', 'apiDocs.html');
    const docsContent = fs.readFileSync(docsPath, 'utf8');
    res.set('Content-Type', 'text/html');
    res.send(docsContent);
  } catch (error) {
    console.error('Error serving documentation:', error);
    res.status(404).send('Documentation not found');
  }
});

// Interactive Swagger UI at /api/docs/interactive
app.use('/api/docs/interactive', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #1a365d; }
  `,
  customSiteTitle: 'yadmanx Pricing Service - Interactive API'
}));

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
    service: 'yadmanx Pricing Service',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    features: featureFlagService.getEnabledProducts(),
    documentation: {
      comprehensive: '/api/docs/',
      interactive: '/api/docs/interactive'
    }
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