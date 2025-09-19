import { DatabaseService } from './DatabaseService.js';
import { Product } from '../models/types.js';

export class ProductService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async getAvailableProducts(): Promise<Product[]> {
    try {
      const products = await this.dbService.getProducts();

      // Filter by feature flags
      return products.filter(product => {
        switch (product.product_type) {
          case 'term_life':
            return process.env.ENABLE_TERM_LIFE === 'true';
          case 'whole_life':
            return process.env.ENABLE_WHOLE_LIFE === 'true';
          case 'annuity':
            return process.env.ENABLE_ANNUITIES === 'true';
          default:
            return false;
        }
      }).filter(product => product.is_active);
    } catch (error) {
      console.error('Error retrieving products:', error);
      throw new Error('Failed to retrieve products');
    }
  }

  async getProductConfiguration(productType: string): Promise<Product | null> {
    try {
      const product = await this.dbService.getProduct(productType);

      if (!product) {
        return null;
      }

      // Check feature flag
      const isEnabled = this.isProductEnabled(productType);
      if (!isEnabled) {
        return null;
      }

      return product;
    } catch (error) {
      console.error('Error retrieving product configuration:', error);
      throw new Error('Failed to retrieve product configuration');
    }
  }

  private isProductEnabled(productType: string): boolean {
    switch (productType) {
      case 'term_life':
        return process.env.ENABLE_TERM_LIFE === 'true';
      case 'whole_life':
        return process.env.ENABLE_WHOLE_LIFE === 'true';
      case 'annuity':
        return process.env.ENABLE_ANNUITIES === 'true';
      default:
        return false;
    }
  }
}