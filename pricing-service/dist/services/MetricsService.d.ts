import { Request, Response, NextFunction } from 'express';
export declare class MetricsService {
    private quotesGeneratedTotal;
    private requestDuration;
    private activeConnections;
    private errorRate;
    private databaseConnections;
    private redisConnections;
    private cacheHitRate;
    private riskClassDistribution;
    constructor();
    requestDurationMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
    recordQuoteGenerated(productType: string, riskClass: string, status: 'success' | 'error'): void;
    recordCacheOperation(operation: 'hit' | 'miss', type: 'quote' | 'rate_table'): void;
    setDatabaseConnections(count: number): void;
    setRedisConnections(count: number): void;
    getMetrics(): Promise<string>;
    getMetricValues(): Promise<{
        quotesGenerated: any;
        avgRequestDuration: any;
        errorRate: any;
        activeConnections: any;
        memoryUsage: NodeJS.MemoryUsage;
        uptime: number;
    }>;
    private getMetricValue;
    reset(): void;
}
//# sourceMappingURL=MetricsService.d.ts.map