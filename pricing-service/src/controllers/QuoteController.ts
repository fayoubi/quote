import { Request, Response } from 'express';
import { PricingEngineFactory } from '../services/PricingEngine.js';
import { UniversalQuoteRequest, ProductType } from '../models/types.js';
import { QuoteService } from '../services/QuoteService.js';
// import { validateQuoteRequest } from '../middleware/validation.js';

export class QuoteController {
  private quoteService: QuoteService;

  constructor() {
    this.quoteService = new QuoteService();
  }

  async calculateQuote(req: Request, res: Response): Promise<void> {
    try {
      const quoteRequest: UniversalQuoteRequest = req.body;

      // Validate product type is enabled
      const productType = quoteRequest.productType as ProductType;
      if (!this.isProductEnabled(productType)) {
        res.status(400).json({
          error: 'Product not available',
          message: `${productType} is currently not enabled`
        });
        return;
      }

      // Get appropriate pricing engine
      const pricingEngine = PricingEngineFactory.createEngine(productType);

      // Calculate quote
      const quoteResponse = await pricingEngine.calculateQuote(quoteRequest);

      // Quotes are ephemeral - no need to save
      // Simply return the calculated quote
      res.status(200).json(quoteResponse);
    } catch (error) {
      console.error('Error calculating quote:', error);
      res.status(400).json({
        error: 'Quote calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getQuote(req: Request, res: Response): Promise<void> {
    try {
      const { quoteId } = req.params;

      const quote = await this.quoteService.getQuote(quoteId);

      if (!quote) {
        res.status(404).json({
          error: 'Quote not found',
          message: `Quote with ID ${quoteId} does not exist`
        });
        return;
      }

      // Check if quote has expired
      if (new Date() > quote.expires_at) {
        res.status(410).json({
          error: 'Quote expired',
          message: 'This quote has expired and is no longer valid'
        });
        return;
      }

      res.status(200).json({ quote });
    } catch (error) {
      console.error('Error retrieving quote:', error);
      res.status(500).json({
        error: 'Failed to retrieve quote',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private isProductEnabled(productType: ProductType): boolean {
    switch (productType) {
      case ProductType.TERM_LIFE:
        return process.env.ENABLE_TERM_LIFE === 'true';
      case ProductType.WHOLE_LIFE:
        return process.env.ENABLE_WHOLE_LIFE === 'true';
      case ProductType.ANNUITY:
        return process.env.ENABLE_ANNUITIES === 'true';
      default:
        return false;
    }
  }
}