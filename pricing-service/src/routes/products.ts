import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';

const router = Router();
const productController = new ProductController();

// GET /api/v1/products
router.get('/',
  async (req, res) => {
    await productController.getAvailableProducts(req, res);
  }
);

// GET /api/v1/products/:productType
router.get('/:productType',
  async (req, res) => {
    await productController.getProductConfiguration(req, res);
  }
);

export default router;