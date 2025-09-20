import { Router } from 'express';
import quoteRoutes from './quotes.js';
import productRoutes from './products.js';
import healthRoutes from './health.js';

const router = Router();

// API routes
router.use('/api/v1/quotes', quoteRoutes);
router.use('/api/v1/products', productRoutes);
router.use('/api/v1/health', healthRoutes);

export default router;