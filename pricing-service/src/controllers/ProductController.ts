import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService.js';
import { ProductType } from '../models/types.js';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  async getAvailableProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.getAvailableProducts();
      res.status(200).json({ products });
    } catch (error) {
      console.error('Error retrieving products:', error);
      res.status(500).json({
        error: 'Failed to retrieve products',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getProductConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { productType } = req.params;

      // Validate product type
      if (!Object.values(ProductType).includes(productType as ProductType)) {
        res.status(400).json({
          error: 'Invalid product type',
          message: `${productType} is not a valid product type`
        });
        return;
      }

      const product = await this.productService.getProductConfiguration(productType);

      if (!product) {
        res.status(404).json({
          error: 'Product not found',
          message: `Product ${productType} does not exist`
        });
        return;
      }

      if (!product.is_active) {
        res.status(403).json({
          error: 'Product not available',
          message: `Product ${productType} is currently disabled`
        });
        return;
      }

      res.status(200).json({ product });
    } catch (error) {
      console.error('Error retrieving product configuration:', error);
      res.status(500).json({
        error: 'Failed to retrieve product configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}