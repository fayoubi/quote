import { Quote } from '../models/types.js';
export declare class RedisService {
    private client;
    private isConnected;
    constructor();
    private connect;
    healthCheck(): Promise<void>;
    cacheQuote(quoteId: string, quote: any, expiresAt: Date): Promise<void>;
    getQuote(quoteId: string): Promise<Quote | null>;
    cacheRateTable(key: string, rateTable: any, ttlSeconds?: number): Promise<void>;
    getRateTable(key: string): Promise<any | null>;
    invalidateQuote(quoteId: string): Promise<void>;
    getStats(): Promise<Record<string, string>>;
    close(): Promise<void>;
}
//# sourceMappingURL=RedisService.d.ts.map