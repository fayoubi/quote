import { PricingEngineFactory } from '../services/PricingEngine.js';
import { ProductType } from '../models/types.js';
import { QuoteService } from '../services/QuoteService.js';
export class QuoteController {
    constructor() {
        this.quoteService = new QuoteService();
    }
    async calculateQuote(req, res) {
        try {
            const quoteRequest = req.body;
            const productType = quoteRequest.productType;
            if (!this.isProductEnabled(productType)) {
                res.status(400).json({
                    error: 'Product not available',
                    message: `${productType} is currently not enabled`
                });
                return;
            }
            const pricingEngine = PricingEngineFactory.createEngine(productType);
            const quoteResponse = await pricingEngine.calculateQuote(quoteRequest);
            res.status(200).json(quoteResponse);
        }
        catch (error) {
            console.error('Error calculating quote:', error);
            res.status(400).json({
                error: 'Quote calculation failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getQuote(req, res) {
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
            if (new Date() > quote.expires_at) {
                res.status(410).json({
                    error: 'Quote expired',
                    message: 'This quote has expired and is no longer valid'
                });
                return;
            }
            res.status(200).json({ quote });
        }
        catch (error) {
            console.error('Error retrieving quote:', error);
            res.status(500).json({
                error: 'Failed to retrieve quote',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    isProductEnabled(productType) {
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
//# sourceMappingURL=QuoteController.js.map