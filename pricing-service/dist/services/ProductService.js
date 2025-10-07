import { DatabaseService } from './DatabaseService.js';
export class ProductService {
    constructor() {
        this.dbService = new DatabaseService();
    }
    async getAvailableProducts() {
        try {
            const products = await this.dbService.getProducts();
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
        }
        catch (error) {
            console.error('Error retrieving products:', error);
            throw new Error('Failed to retrieve products');
        }
    }
    async getProductConfiguration(productType) {
        try {
            const product = await this.dbService.getProduct(productType);
            if (!product) {
                return null;
            }
            const isEnabled = this.isProductEnabled(productType);
            if (!isEnabled) {
                return null;
            }
            return product;
        }
        catch (error) {
            console.error('Error retrieving product configuration:', error);
            throw new Error('Failed to retrieve product configuration');
        }
    }
    isProductEnabled(productType) {
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
//# sourceMappingURL=ProductService.js.map