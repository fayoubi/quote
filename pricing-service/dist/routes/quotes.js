import { Router } from 'express';
import { QuoteController } from '../controllers/QuoteController.js';
import { validateQuoteRequest } from '../middleware/validation.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.js';
const router = Router();
const quoteController = new QuoteController();
router.post('/calculate', rateLimitMiddleware, validateQuoteRequest, async (req, res) => {
    await quoteController.calculateQuote(req, res);
});
router.get('/:quoteId', async (req, res) => {
    await quoteController.getQuote(req, res);
});
export default router;
//# sourceMappingURL=quotes.js.map