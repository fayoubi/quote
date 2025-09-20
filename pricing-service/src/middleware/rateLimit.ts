import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private getClientId(req: Request): string {
    // In production, you might want to use req.ip or a combination of factors
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    }
  }

  check(req: Request): { allowed: boolean; resetTime?: number; remaining?: number } {
    const clientId = this.getClientId(req);
    const now = Date.now();

    if (!this.store[clientId] || this.store[clientId].resetTime <= now) {
      // First request or window has reset
      this.store[clientId] = {
        count: 1,
        resetTime: now + this.windowMs
      };

      return {
        allowed: true,
        resetTime: this.store[clientId].resetTime,
        remaining: this.maxRequests - 1
      };
    }

    // Existing window
    this.store[clientId].count++;

    if (this.store[clientId].count > this.maxRequests) {
      return {
        allowed: false,
        resetTime: this.store[clientId].resetTime,
        remaining: 0
      };
    }

    return {
      allowed: true,
      resetTime: this.store[clientId].resetTime,
      remaining: this.maxRequests - this.store[clientId].count
    };
  }
}

// Create rate limiter instance
const rateLimiter = new RateLimiter(
  parseInt(process.env.API_RATE_LIMIT || '100'),
  15 * 60 * 1000 // 15 minutes
);

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const result = rateLimiter.check(req);

  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': process.env.API_RATE_LIMIT || '100',
    'X-RateLimit-Remaining': result.remaining?.toString() || '0',
    'X-RateLimit-Reset': result.resetTime ? new Date(result.resetTime).toISOString() : ''
  });

  if (!result.allowed) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : null
    });
    return;
  }

  next();
};