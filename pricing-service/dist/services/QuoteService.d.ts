import { Quote } from '../models/types.js';
export declare class QuoteService {
    private dbService;
    private redisService;
    constructor();
    saveQuote(quote: any): Promise<void>;
    getQuote(quoteId: string): Promise<Quote | null>;
    deleteExpiredQuotes(): Promise<number>;
}
//# sourceMappingURL=QuoteService.d.ts.map