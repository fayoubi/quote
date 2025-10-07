import { DatabaseService } from './DatabaseService.js';
import { RedisService } from './RedisService.js';
import { Gender } from '../models/types.js';
export class QuoteService {
    constructor() {
        this.dbService = new DatabaseService();
        this.redisService = new RedisService();
    }
    async saveQuote(quote) {
        try {
            await this.dbService.saveQuote({
                quote_id: quote.quoteId,
                product_type: quote.productType,
                applicant_data: {
                    gender: Gender.MALE,
                    birthDate: new Date(Date.now() - (quote.riskAssessment.age * 365.25 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                    height: 0,
                    weight: 0,
                    city: '',
                    usesNicotine: !!quote.riskAssessment?.riskFactors?.includes('Nicotine use')
                },
                pricing_result: quote.pricing,
                eligibility_flags: quote.eligibilityFlags,
                created_at: quote.createdAt,
                expires_at: quote.expiresAt
            });
            await this.redisService.cacheQuote(quote.quoteId, quote, quote.expiresAt);
        }
        catch (error) {
            console.error('Error saving quote:', error);
            throw new Error('Failed to save quote');
        }
    }
    async getQuote(quoteId) {
        try {
            const cachedQuote = await this.redisService.getQuote(quoteId);
            if (cachedQuote) {
                return cachedQuote;
            }
            const quote = await this.dbService.getQuote(quoteId);
            if (quote) {
                await this.redisService.cacheQuote(quoteId, quote, quote.expires_at);
            }
            return quote;
        }
        catch (error) {
            console.error('Error retrieving quote:', error);
            throw new Error('Failed to retrieve quote');
        }
    }
    async deleteExpiredQuotes() {
        try {
            return await this.dbService.deleteExpiredQuotes();
        }
        catch (error) {
            console.error('Error deleting expired quotes:', error);
            throw new Error('Failed to delete expired quotes');
        }
    }
}
//# sourceMappingURL=QuoteService.js.map