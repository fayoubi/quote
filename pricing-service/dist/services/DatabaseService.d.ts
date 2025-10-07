import { Product, Quote, RateTable } from '../models/types.js';
export declare class DatabaseService {
    private pool;
    constructor();
    healthCheck(): Promise<void>;
    getProducts(): Promise<Product[]>;
    getProduct(productType: string): Promise<Product | null>;
    saveQuote(quote: Quote): Promise<void>;
    getQuote(quoteId: string): Promise<Quote | null>;
    deleteExpiredQuotes(): Promise<number>;
    getRateTable(productType: string, riskClass: string, gender: string, age: number, termLength?: number): Promise<RateTable | null>;
    close(): Promise<void>;
}
//# sourceMappingURL=DatabaseService.d.ts.map