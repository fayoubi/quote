class RateLimiter {
    constructor(maxRequests = 100, windowMs = 15 * 60 * 1000) {
        this.store = {};
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }
    getClientId(req) {
        return req.ip || req.socket.remoteAddress || 'unknown';
    }
    cleanup() {
        const now = Date.now();
        for (const key in this.store) {
            if (this.store[key].resetTime <= now) {
                delete this.store[key];
            }
        }
    }
    check(req) {
        const clientId = this.getClientId(req);
        const now = Date.now();
        if (!this.store[clientId] || this.store[clientId].resetTime <= now) {
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
const defaultRateLimiter = new RateLimiter(parseInt(process.env.API_RATE_LIMIT || '100'), 15 * 60 * 1000);
const quoteRateLimiter = new RateLimiter(parseInt(process.env.QUOTE_RATE_LIMIT || '20'), 15 * 60 * 1000);
const contributionRateLimiter = new RateLimiter(parseInt(process.env.CONTRIBUTION_RATE_LIMIT || '50'), 15 * 60 * 1000);
const createRateLimitMiddleware = (limiter, limitName) => {
    return (req, res, next) => {
        const result = limiter.check(req);
        res.set({
            'X-RateLimit-Limit': limiter['maxRequests'].toString(),
            'X-RateLimit-Remaining': result.remaining?.toString() || '0',
            'X-RateLimit-Reset': result.resetTime ? new Date(result.resetTime).toISOString() : ''
        });
        if (!result.allowed) {
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: `Too many ${limitName} requests. Please try again later.`,
                retryAfter: result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : null
            });
            return;
        }
        next();
    };
};
export const rateLimitMiddleware = createRateLimitMiddleware(defaultRateLimiter, 'API');
export const rateLimit = {
    default: createRateLimitMiddleware(defaultRateLimiter, 'API'),
    quote: createRateLimitMiddleware(quoteRateLimiter, 'quote'),
    contribution: createRateLimitMiddleware(contributionRateLimiter, 'contribution'),
};
//# sourceMappingURL=rateLimit.js.map