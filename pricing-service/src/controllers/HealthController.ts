import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService.js';
import { RedisService } from '../services/RedisService.js';

export class HealthController {
  private dbService: DatabaseService;
  private redisService: RedisService;

  constructor() {
    this.dbService = new DatabaseService();
    this.redisService = new RedisService();
  }

  async basicHealthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };

      res.status(200).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deepHealthCheck(_req: Request, res: Response): Promise<void> {
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
          database: dbCheck.status === 'fulfilled' ? dbCheck.value : { status: 'failed', error: (dbCheck as PromiseRejectedResult).reason },
          redis: redisCheck.status === 'fulfilled' ? redisCheck.value : { status: 'failed', error: (redisCheck as PromiseRejectedResult).reason },
          featureFlags: flagsCheck.status === 'fulfilled' ? flagsCheck.value : { status: 'failed', error: (flagsCheck as PromiseRejectedResult).reason }
        }
      };

      const hasFailures = Object.values(health.checks).some(check =>
        typeof check === 'object' && 'status' in check && check.status === 'failed'
      );

      if (hasFailures) {
        health.status = 'degraded';
        res.status(503).json(health);
      } else {
        res.status(200).json(health);
      }
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async checkDatabase(): Promise<{ status: string; responseTime: number }> {
    const start = Date.now();
    await this.dbService.healthCheck();
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime
    };
  }

  private async checkRedis(): Promise<{ status: string; responseTime: number }> {
    const start = Date.now();
    await this.redisService.healthCheck();
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime
    };
  }

  private async checkFeatureFlags(): Promise<{ status: string; enabledProducts: string[] }> {
    const enabledProducts: string[] = [];

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