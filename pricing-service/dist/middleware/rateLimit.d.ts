import { Request, Response, NextFunction } from 'express';
export declare const rateLimitMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const rateLimit: {
    default: (req: Request, res: Response, next: NextFunction) => void;
    quote: (req: Request, res: Response, next: NextFunction) => void;
    contribution: (req: Request, res: Response, next: NextFunction) => void;
};
//# sourceMappingURL=rateLimit.d.ts.map