import { Router } from 'express';
import quoteRoutes from './quotes.js';
import productRoutes from './products.js';
import healthRoutes from './health.js';
import contributionRoutes from './contributions.js';
const router = Router();
router.use('/api/v1/quotes', quoteRoutes);
router.use('/api/v1/products', productRoutes);
router.use('/api/v1/health', healthRoutes);
router.use('/api/v1/contributions', contributionRoutes);
export default router;
//# sourceMappingURL=index.js.map