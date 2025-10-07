import { createClient } from 'redis';
export class RedisService {
    constructor() {
        this.isConnected = false;
        this.client = createClient({
            url: process.env.REDIS_URL,
            socket: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
            password: process.env.REDIS_PASSWORD || undefined,
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });
        this.client.on('connect', () => {
            console.log('Redis Client Connected');
            this.isConnected = true;
        });
        this.client.on('disconnect', () => {
            console.log('Redis Client Disconnected');
            this.isConnected = false;
        });
        this.connect();
    }
    async connect() {
        try {
            await this.client.connect();
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
        }
    }
    async healthCheck() {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        await this.client.ping();
    }
    async cacheQuote(quoteId, quote, expiresAt) {
        if (!this.isConnected) {
            console.warn('Redis not connected, skipping cache');
            return;
        }
        try {
            const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
            if (ttl > 0) {
                await this.client.setEx(`quote:${quoteId}`, ttl, JSON.stringify(quote));
            }
        }
        catch (error) {
            console.error('Error caching quote:', error);
        }
    }
    async getQuote(quoteId) {
        if (!this.isConnected) {
            return null;
        }
        try {
            const cached = await this.client.get(`quote:${quoteId}`);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            console.error('Error retrieving cached quote:', error);
            return null;
        }
    }
    async cacheRateTable(key, rateTable, ttlSeconds = 3600) {
        if (!this.isConnected) {
            return;
        }
        try {
            await this.client.setEx(`rate:${key}`, ttlSeconds, JSON.stringify(rateTable));
        }
        catch (error) {
            console.error('Error caching rate table:', error);
        }
    }
    async getRateTable(key) {
        if (!this.isConnected) {
            return null;
        }
        try {
            const cached = await this.client.get(`rate:${key}`);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            console.error('Error retrieving cached rate table:', error);
            return null;
        }
    }
    async invalidateQuote(quoteId) {
        if (!this.isConnected) {
            return;
        }
        try {
            await this.client.del(`quote:${quoteId}`);
        }
        catch (error) {
            console.error('Error invalidating quote cache:', error);
        }
    }
    async getStats() {
        if (!this.isConnected) {
            return {};
        }
        try {
            const info = await this.client.info();
            return info.split('\n').reduce((acc, line) => {
                if (!line || line.startsWith('#'))
                    return acc;
                const idx = line.indexOf(':');
                if (idx > -1) {
                    const key = line.slice(0, idx);
                    const value = line.slice(idx + 1).trim();
                    acc[key] = value;
                }
                return acc;
            }, {});
        }
        catch (error) {
            console.error('Error getting Redis stats:', error);
            return {};
        }
    }
    async close() {
        if (this.isConnected) {
            await this.client.disconnect();
        }
    }
}
//# sourceMappingURL=RedisService.js.map