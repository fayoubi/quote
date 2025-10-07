import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';
const router = Router();
const productController = new ProductController();
router.get('/', async (req, res) => {
    await productController.getAvailableProducts(req, res);
});
router.get('/:productType', async (req, res) => {
    await productController.getProductConfiguration(req, res);
});
export default router;
//# sourceMappingURL=products.js.map