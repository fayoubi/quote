import { Request, Response } from 'express';
export declare class HealthController {
    private dbService;
    private redisService;
    constructor();
    basicHealthCheck(_req: Request, res: Response): Promise<void>;
    deepHealthCheck(_req: Request, res: Response): Promise<void>;
    private checkDatabase;
    private checkRedis;
    private checkFeatureFlags;
}
//# sourceMappingURL=HealthController.d.ts.map