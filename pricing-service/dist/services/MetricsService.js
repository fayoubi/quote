import * as prometheus from 'prom-client';
export class MetricsService {
    constructor() {
        prometheus.register.clear();
        prometheus.collectDefaultMetrics({
            prefix: 'pricing_service_',
        });
        this.quotesGeneratedTotal = new prometheus.Counter({
            name: 'pricing_service_quotes_generated_total',
            help: 'Total number of quotes generated',
            labelNames: ['product_type', 'risk_class', 'status']
        });
        this.requestDuration = new prometheus.Histogram({
            name: 'pricing_service_request_duration_seconds',
            help: 'Request duration in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
        });
        this.activeConnections = new prometheus.Gauge({
            name: 'pricing_service_active_connections',
            help: 'Number of active connections'
        });
        this.errorRate = new prometheus.Counter({
            name: 'pricing_service_errors_total',
            help: 'Total number of errors',
            labelNames: ['type', 'endpoint']
        });
        this.databaseConnections = new prometheus.Gauge({
            name: 'pricing_service_database_connections',
            help: 'Number of active database connections'
        });
        this.redisConnections = new prometheus.Gauge({
            name: 'pricing_service_redis_connections',
            help: 'Number of active Redis connections'
        });
        this.cacheHitRate = new prometheus.Counter({
            name: 'pricing_service_cache_operations_total',
            help: 'Cache operations (hits/misses)',
            labelNames: ['operation', 'type']
        });
        this.riskClassDistribution = new prometheus.Counter({
            name: 'pricing_service_risk_class_distribution_total',
            help: 'Distribution of risk classes assigned',
            labelNames: ['product_type', 'risk_class']
        });
        prometheus.register.registerMetric(this.quotesGeneratedTotal);
        prometheus.register.registerMetric(this.requestDuration);
        prometheus.register.registerMetric(this.activeConnections);
        prometheus.register.registerMetric(this.errorRate);
        prometheus.register.registerMetric(this.databaseConnections);
        prometheus.register.registerMetric(this.redisConnections);
        prometheus.register.registerMetric(this.cacheHitRate);
        prometheus.register.registerMetric(this.riskClassDistribution);
    }
    requestDurationMiddleware() {
        return (req, res, next) => {
            const start = Date.now();
            this.activeConnections.inc();
            res.on('finish', () => {
                const duration = (Date.now() - start) / 1000;
                this.requestDuration
                    .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
                    .observe(duration);
                this.activeConnections.dec();
                if (res.statusCode >= 400) {
                    this.errorRate
                        .labels(res.statusCode >= 500 ? 'server_error' : 'client_error', req.path)
                        .inc();
                }
            });
            next();
        };
    }
    recordQuoteGenerated(productType, riskClass, status) {
        this.quotesGeneratedTotal.labels(productType, riskClass, status).inc();
        if (status === 'success') {
            this.riskClassDistribution.labels(productType, riskClass).inc();
        }
    }
    recordCacheOperation(operation, type) {
        this.cacheHitRate.labels(operation, type).inc();
    }
    setDatabaseConnections(count) {
        this.databaseConnections.set(count);
    }
    setRedisConnections(count) {
        this.redisConnections.set(count);
    }
    async getMetrics() {
        return prometheus.register.metrics();
    }
    async getMetricValues() {
        const metrics = await prometheus.register.getMetricsAsJSON();
        return {
            quotesGenerated: this.getMetricValue(metrics, 'pricing_service_quotes_generated_total'),
            avgRequestDuration: this.getMetricValue(metrics, 'pricing_service_request_duration_seconds'),
            errorRate: this.getMetricValue(metrics, 'pricing_service_errors_total'),
            activeConnections: this.getMetricValue(metrics, 'pricing_service_active_connections'),
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
        };
    }
    getMetricValue(metrics, metricName) {
        const metric = metrics.find(m => m.name === metricName);
        return metric ? metric.values : null;
    }
    reset() {
        prometheus.register.resetMetrics();
    }
}
//# sourceMappingURL=MetricsService.js.map