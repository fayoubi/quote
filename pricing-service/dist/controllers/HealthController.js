import { DatabaseService } from '../services/DatabaseService.js';
import { RedisService } from '../services/RedisService.js';
export class HealthController {
    constructor() {
        this.dbService = new DatabaseService();
        this.redisService = new RedisService();
    }
    async basicHealthCheck(_req, res) {
        try {
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            };
            res.status(200).json(health);
        }
        catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async deepHealthCheck(_req, res) {
        try {
            const checks = await Promise.allSettled([
                this.checkDatabase(),
                this.checkRedis(),
                this.checkFeatureFlags()
            ]);
            const dbCheck = checks[0];
            const redisCheck = checks[1];
            const flagsCheck = checks[2];
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                checks: {
                    database: dbCheck.status === 'fulfilled' ? dbCheck.value : { status: 'failed', error: dbCheck.reason },
                    redis: redisCheck.status === 'fulfilled' ? redisCheck.value : { status: 'failed', error: redisCheck.reason },
                    featureFlags: flagsCheck.status === 'fulfilled' ? flagsCheck.value : { status: 'failed', error: flagsCheck.reason }
                }
            };
            const hasFailures = Object.values(health.checks).some(check => typeof check === 'object' && 'status' in check && check.status === 'failed');
            if (hasFailures) {
                health.status = 'degraded';
                res.status(503).json(health);
            }
            else {
                res.status(200).json(health);
            }
        }
        catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async checkDatabase() {
        const start = Date.now();
        await this.dbService.healthCheck();
        const responseTime = Date.now() - start;
        return {
            status: 'healthy',
            responseTime
        };
    }
    async checkRedis() {
        const start = Date.now();
        await this.redisService.healthCheck();
        const responseTime = Date.now() - start;
        return {
            status: 'healthy',
            responseTime
        };
    }
    async checkFeatureFlags() {
        const enabledProducts = [];
        if (process.env.ENABLE_TERM_LIFE === 'true') {
            enabledProducts.push('term_life');
        }
        if (process.env.ENABLE_WHOLE_LIFE === 'true') {
            enabledProducts.push('whole_life');
        }
        if (process.env.ENABLE_ANNUITIES === 'true') {
            enabledProducts.push('annuities');
        }
        return {
            status: 'healthy',
            enabledProducts
        };
    }
}
//# sourceMappingURL=HealthController.js.map