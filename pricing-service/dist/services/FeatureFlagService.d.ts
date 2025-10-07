import { ProductType } from '../models/types.js';
export interface FeatureFlag {
    name: string;
    enabled: boolean;
    description: string;
    dependencies?: string[];
}
export declare class FeatureFlagService {
    private flags;
    constructor();
    private initializeFlags;
    isEnabled(flagName: string): boolean;
    isProductEnabled(productType: ProductType): boolean;
    getEnabledProducts(): ProductType[];
    getAllFlags(): FeatureFlag[];
    getFlag(flagName: string): FeatureFlag | undefined;
    updateFlag(flagName: string, enabled: boolean): boolean;
    validateConfiguration(): {
        isValid: boolean;
        errors: string[];
    };
}
export declare const featureFlagService: FeatureFlagService;
//# sourceMappingURL=FeatureFlagService.d.ts.map