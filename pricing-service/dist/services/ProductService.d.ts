import { Product } from '../models/types.js';
export declare class ProductService {
    private dbService;
    constructor();
    getAvailableProducts(): Promise<Product[]>;
    getProductConfiguration(productType: string): Promise<Product | null>;
    private isProductEnabled;
}
//# sourceMappingURL=ProductService.d.ts.map