import { TermLifePricingEngine, PricingEngineFactory } from '../../src/services/PricingEngine.js';
import { ProductType, Gender, UniversalQuoteRequest } from '../../src/models/types.js';

describe('PricingEngine', () => {
  let pricingEngine: TermLifePricingEngine;

  beforeEach(() => {
    pricingEngine = new TermLifePricingEngine();
  });

  describe('PricingEngineFactory', () => {
    it('should create TermLifePricingEngine for term_life product', () => {
      const engine = PricingEngineFactory.createEngine(ProductType.TERM_LIFE);
      expect(engine).toBeInstanceOf(TermLifePricingEngine);
    });

    it('should throw error for unsupported products', () => {
      expect(() => PricingEngineFactory.createEngine(ProductType.WHOLE_LIFE))
        .toThrow('Whole Life product not yet supported');
    });
  });

  describe('TermLifePricingEngine - Input Validation', () => {
    const validRequest: UniversalQuoteRequest = {
      productType: ProductType.TERM_LIFE,
      applicant: {
        gender: Gender.MALE,
        birthDate: '1985-03-15',
        height: 180,
        weight: 75,
        city: 'Casablanca',
        usesNicotine: false
      },
      policy: {
        termLength: 20,
        coverageAmount: 500000
      }
    };

    it('should validate valid request', () => {
      const result = pricingEngine.validateInputs(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing birth date', () => {
      const request = {
        ...validRequest,
        applicant: { ...validRequest.applicant, birthDate: '' }
      };
      const result = pricingEngine.validateInputs(request);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Birth date is required');
    });

    it('should reject invalid term length', () => {
      const request = {
        ...validRequest,
        policy: { ...validRequest.policy, termLength: 15 }
      };
      const result = pricingEngine.validateInputs(request);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Term length must be 10 or 20 years');
    });

    it('should reject coverage amount outside range', () => {
      const request = {
        ...validRequest,
        policy: { ...validRequest.policy, coverageAmount: 200000 }
      };
      const result = pricingEngine.validateInputs(request);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Coverage amount must be between $250,000 and $1,500,000');
    });

    it('should reject invalid height and weight', () => {
      const request = {
        ...validRequest,
        applicant: {
          ...validRequest.applicant,
          height: 0,
          weight: -5
        }
      };
      const result = pricingEngine.validateInputs(request);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Height must be positive');
      expect(result.errors).toContain('Weight must be positive');
    });
  });

  describe('TermLifePricingEngine - Quote Calculation', () => {
    const validRequest: UniversalQuoteRequest = {
      productType: ProductType.TERM_LIFE,
      applicant: {
        gender: Gender.MALE,
        birthDate: '1985-03-15', // ~39 years old
        height: 180,
        weight: 75, // BMI ~23.1
        city: 'Casablanca',
        usesNicotine: false
      },
      policy: {
        termLength: 20,
        coverageAmount: 500000
      }
    };

    it('should calculate quote for healthy applicant', async () => {
      const result = await pricingEngine.calculateQuote(validRequest);

      expect(result.quote).toBeDefined();
      expect(result.quote.quoteId).toMatch(/^quote_term_/);
      expect(result.quote.productType).toBe(ProductType.TERM_LIFE);
      expect(result.quote.pricing.monthlyPremium).toBeGreaterThan(0);
      expect(result.quote.pricing.annualPremium).toBeGreaterThan(0);
      expect(result.quote.riskAssessment.bmi).toBeCloseTo(23.1, 1);
      expect(result.quote.riskAssessment.age).toBe(39);
    });

    it('should apply nicotine penalty', async () => {
      const smokingRequest = {
        ...validRequest,
        applicant: { ...validRequest.applicant, usesNicotine: true }
      };

      const nonSmokingResult = await pricingEngine.calculateQuote(validRequest);
      const smokingResult = await pricingEngine.calculateQuote(smokingRequest);

      expect(smokingResult.quote.pricing.annualPremium)
        .toBeGreaterThan(nonSmokingResult.quote.pricing.annualPremium);

      expect(smokingResult.quote.riskAssessment.riskFactors)
        .toContain('Nicotine use');
    });

    it('should apply volume discounts', async () => {
      const highCoverageRequest = {
        ...validRequest,
        policy: { ...validRequest.policy, coverageAmount: 1000000 }
      };

      const standardResult = await pricingEngine.calculateQuote(validRequest);
      const highCoverageResult = await pricingEngine.calculateQuote(highCoverageRequest);

      // Rate per thousand should be lower for high coverage due to discount
      const standardRatePerThousand = standardResult.quote.pricing.annualPremium / 500;
      const highCoverageRatePerThousand = highCoverageResult.quote.pricing.annualPremium / 1000;

      expect(highCoverageRatePerThousand).toBeLessThan(standardRatePerThousand);
    });

    it('should flag high-risk applicants for decline', async () => {
      const highRiskRequest = {
        ...validRequest,
        applicant: {
          ...validRequest.applicant,
          birthDate: '1950-01-01', // 74 years old
          weight: 130, // High BMI with 180cm height
          usesNicotine: true
        }
      };

      const result = await pricingEngine.calculateQuote(highRiskRequest);

      expect(result.quote.eligibilityFlags.wouldDeclinePostUnderwriting).toBe(true);
      expect(result.quote.eligibilityFlags.declineReasons).toContain('Age exceeds maximum');
    });

    it('should flag applicants for additional underwriting', async () => {
      const moderateRiskRequest = {
        ...validRequest,
        applicant: {
          ...validRequest.applicant,
          birthDate: '1960-01-01', // 64 years old
          weight: 100 // BMI ~30.9
        }
      };

      const result = await pricingEngine.calculateQuote(moderateRiskRequest);

      expect(result.quote.eligibilityFlags.requiresAdditionalUnderwriting).toBe(true);
    });

    it('should handle female gender with lower rates', async () => {
      const femaleRequest = {
        ...validRequest,
        applicant: { ...validRequest.applicant, gender: Gender.FEMALE }
      };

      const maleResult = await pricingEngine.calculateQuote(validRequest);
      const femaleResult = await pricingEngine.calculateQuote(femaleRequest);

      // Female rates should be lower (all else being equal)
      expect(femaleResult.quote.pricing.annualPremium)
        .toBeLessThan(maleResult.quote.pricing.annualPremium);
    });

    it('should calculate different rates for 10 vs 20 year terms', async () => {
      const term10Request = {
        ...validRequest,
        policy: { ...validRequest.policy, termLength: 10 }
      };

      const term10Result = await pricingEngine.calculateQuote(term10Request);
      const term20Result = await pricingEngine.calculateQuote(validRequest);

      // 20-year term should be more expensive
      expect(term20Result.quote.pricing.annualPremium)
        .toBeGreaterThan(term10Result.quote.pricing.annualPremium);
    });
  });

  describe('TermLifePricingEngine - Edge Cases', () => {
    it('should throw error for invalid input', async () => {
      const invalidRequest = {
        productType: ProductType.TERM_LIFE,
        applicant: {
          gender: Gender.MALE,
          birthDate: '', // Invalid
          height: 180,
          weight: 75,
          city: 'Casablanca',
          usesNicotine: false
        },
        policy: {
          termLength: 20,
          coverageAmount: 500000
        }
      };

      await expect(pricingEngine.calculateQuote(invalidRequest))
        .rejects.toThrow('Invalid request');
    });

    it('should handle extreme BMI values', async () => {
      const extremeBMIRequest: UniversalQuoteRequest = {
        productType: ProductType.TERM_LIFE,
        applicant: {
          gender: Gender.MALE,
          birthDate: '1985-03-15',
          height: 180,
          weight: 150, // BMI ~46.3
          city: 'Casablanca',
          usesNicotine: false
        },
        policy: {
          termLength: 20,
          coverageAmount: 500000
        }
      };

      const result = await pricingEngine.calculateQuote(extremeBMIRequest);

      expect(result.quote.riskAssessment.riskClass).toBe('Substandard');
      expect(result.quote.riskAssessment.riskFactors).toContain('Severe obesity');
      expect(result.quote.eligibilityFlags.wouldDeclinePostUnderwriting).toBe(true);
    });
  });
});