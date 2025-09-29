import { DatabaseService } from './DatabaseService.js';
import { RedisService } from './RedisService.js';
import { Quote, Gender } from '../models/types.js';

export class QuoteService {
  private dbService: DatabaseService;
  private redisService: RedisService;

  constructor() {
    this.dbService = new DatabaseService();
    this.redisService = new RedisService();
  }

  async saveQuote(quote: any): Promise<void> {
    try {
      // Save to database
      await this.dbService.saveQuote({
        quote_id: quote.quoteId,
        product_type: quote.productType,
        applicant_data: {
          // We need to reconstruct applicant data from the quote
          gender: Gender.MALE, // Default placeholder; source comes from request
          birthDate: new Date(Date.now() - (quote.riskAssessment.age * 365.25 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          height: 0, // This would come from the original request
          weight: 0, // This would come from the original request
          city: '', // This would come from the original request
          usesNicotine: !!quote.riskAssessment?.riskFactors?.includes('Nicotine use')
        },
        pricing_result: quote.pricing,
        eligibility_flags: quote.eligibilityFlags,
        created_at: quote.createdAt,
        expires_at: quote.expiresAt
      });

      // Cache in Redis for faster access
      await this.redisService.cacheQuote(quote.quoteId, quote, quote.expiresAt);
    } catch (error) {
      console.error('Error saving quote:', error);
      throw new Error('Failed to save quote');
    }
  }

  async getQuote(quoteId: string): Promise<Quote | null> {
    try {
      // Try Redis first
      const cachedQuote = await this.redisService.getQuote(quoteId);
      if (cachedQuote) {
        return cachedQuote;
      }

      // Fall back to database
      const quote = await this.dbService.getQuote(quoteId);
      if (quote) {
        // Cache for future requests
        await this.redisService.cacheQuote(quoteId, quote, quote.expires_at);
      }

      return quote;
    } catch (error) {
      console.error('Error retrieving quote:', error);
      throw new Error('Failed to retrieve quote');
    }
  }

  async deleteExpiredQuotes(): Promise<number> {
    try {
      return await this.dbService.deleteExpiredQuotes();
    } catch (error) {
      console.error('Error deleting expired quotes:', error);
      throw new Error('Failed to delete expired quotes');
    }
  }
}