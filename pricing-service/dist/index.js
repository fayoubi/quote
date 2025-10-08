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
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
if (config.nodeEnv !== 'test') {
    app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}
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
    apis: ['./src/routes/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.get('/api/docs/', (_req, res) => {
    try {
        const docsPath = path.join(__dirname, 'docs', 'api.html');
        if (fs.existsSync(docsPath)) {
            const docsContent = fs.readFileSync(docsPath, 'utf8');
            res.set('Content-Type', 'text/html');
            res.send(docsContent);
        }
        else {
            res.status(404).json({
                error: 'Documentation not found',
                message: 'API documentation is being prepared',
            });
        }
    }
    catch (error) {
        console.error('Error serving documentation:', error);
        res.status(500).json({ error: 'Error loading documentation' });
    }
});
app.use('/api/docs/interactive', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #1a365d; }
  `,
    customSiteTitle: 'yadmanx Pricing Service - Interactive API'
}));
let metricsService;
if (featureFlagService.isEnabled('metrics_collection')) {
    metricsService = new MetricsService();
    app.use(metricsService.requestDurationMiddleware());
    app.get('/api/v1/metrics', async (_req, res) => {
        try {
            const metrics = await metricsService.getMetrics();
            res.set('Content-Type', 'text/plain');
            res.send(metrics);
        }
        catch (error) {
            res.status(500).send('Error generating metrics');
        }
    });
}
app.use('/', routes);
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
app.use(notFoundHandler);
app.use(errorHandler);
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    process.exit(0);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
const startServer = async () => {
    try {
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
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${config.port} is already in use`);
            }
            else {
                console.error('Server error:', error);
            }
            process.exit(1);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}
export default app;
//# sourceMappingURL=index.js.map