import { UniversalQuoteRequest, UniversalQuoteResponse, ValidationResult, ProductType } from '../models/types.js';
export interface PricingEngine {
    calculateQuote(request: UniversalQuoteRequest): Promise<UniversalQuoteResponse>;
    validateInputs(request: UniversalQuoteRequest): ValidationResult;
}
export declare class PricingEngineFactory {
    static createEngine(productType: ProductType): PricingEngine;
}
export declare class TermLifePricingEngine implements PricingEngine {
    validateInputs(request: UniversalQuoteRequest): ValidationResult;
    calculateQuote(request: UniversalQuoteRequest): Promise<UniversalQuoteResponse>;
    private assessRisk;
    private getBaseRate;
    private assessEligibility;
}
//# sourceMappingURL=PricingEngine.d.ts.map