import { Router } from 'express';
import { QuoteController } from '../controllers/QuoteController.js';
import { validateQuoteRequest } from '../middleware/validation.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.js';

const router = Router();
const quoteController = new QuoteController();

// POST /api/v1/quotes/calculate
router.post('/calculate',
  rateLimitMiddleware,
  validateQuoteRequest,
  async (req, res) => {
    await quoteController.calculateQuote(req, res);
  }
);

// GET /api/v1/quotes/:quoteId
router.get('/:quoteId',
  async (req, res) => {
    await quoteController.getQuote(req, res);
  }
);

export default router;