import { UniversalQuoteRequest, UniversalQuoteResponse, ValidationResult, ProductType } from '../models/types.js';

export interface PricingEngine {
  calculateQuote(request: UniversalQuoteRequest): Promise<UniversalQuoteResponse>;
  validateInputs(request: UniversalQuoteRequest): ValidationResult;
}

export class PricingEngineFactory {
  static createEngine(productType: ProductType): PricingEngine {
    switch (productType) {
      case ProductType.TERM_LIFE:
        return new TermLifePricingEngine();
      case ProductType.WHOLE_LIFE:
        throw new Error('Whole Life product not yet supported');
      case ProductType.ANNUITY:
        throw new Error('Annuity product not yet supported');
      default:
        throw new Error(`Unknown product type: ${productType}`);
    }
  }
}

export class TermLifePricingEngine implements PricingEngine {
  validateInputs(request: UniversalQuoteRequest): ValidationResult {
    const errors: string[] = [];

    // Validate applicant data
    if (!request.applicant.birthDate) {
      errors.push('Birth date is required');
    }

    if (request.applicant.height <= 0) {
      errors.push('Height must be positive');
    }

    if (request.applicant.weight <= 0) {
      errors.push('Weight must be positive');
    }

    if (!request.applicant.city) {
      errors.push('City is required');
    }

    // Validate policy data
    if (![10, 20].includes(request.policy.termLength)) {
      errors.push('Term length must be 10 or 20 years');
    }

    if (request.policy.coverageAmount < 250000 || request.policy.coverageAmount > 1500000) {
      errors.push('Coverage amount must be between $250,000 and $1,500,000');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async calculateQuote(request: UniversalQuoteRequest): Promise<UniversalQuoteResponse> {
    const validation = this.validateInputs(request);
    if (!validation.isValid) {
      throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
    }

    // Calculate age
    const birthDate = new Date(request.applicant.birthDate);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Calculate BMI
    const heightInMeters = request.applicant.height / 100;
    const bmi = request.applicant.weight / (heightInMeters * heightInMeters);

    // Risk assessment
    const riskAssessment = this.assessRisk(request.applicant, age, bmi);

    // Calculate base rate
    const baseRate = this.getBaseRate(
      riskAssessment.riskClass,
      request.applicant.gender,
      age,
      request.policy.termLength
    );

    // Apply adjustments
    let adjustedRate = baseRate;

    // Gender adjustment (already included in base rate table)

    // Nicotine penalty
    if (request.applicant.usesNicotine) {
      adjustedRate *= 1.75; // 75% increase
    }

    // Volume discounts
    if (request.policy.coverageAmount >= 1000000) {
      adjustedRate *= 0.9; // 10% discount
    } else if (request.policy.coverageAmount >= 500000) {
      adjustedRate *= 0.95; // 5% discount
    }

    // Calculate premiums
    const annualPremium = (request.policy.coverageAmount / 1000) * adjustedRate;
    const monthlyPremium = annualPremium / 12;

    // Eligibility flags
    const eligibilityFlags = this.assessEligibility(age, bmi, request.applicant.usesNicotine);

    const quoteId = `quote_term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + (720 * 60 * 60 * 1000)); // 720 hours

    return {
      quote: {
        quoteId,
        productType: request.productType,
        pricing: {
          monthlyPremium: Math.round(monthlyPremium * 100) / 100,
          annualPremium: Math.round(annualPremium * 100) / 100
        },
        riskAssessment,
        eligibilityFlags,
        createdAt,
        expiresAt
      }
    };
  }

  private assessRisk(applicant: any, age: number, bmi: number): any {
    const riskFactors: string[] = [];
    let riskClass = 'SuperPreferredPlus';

    // Age-based risk
    if (age > 65) {
      riskFactors.push('Advanced age');
      riskClass = 'Standard';
    } else if (age > 55) {
      riskFactors.push('Elevated age');
      if (riskClass === 'SuperPreferredPlus') riskClass = 'Preferred';
    }

    // BMI-based risk
    if (bmi > 35) {
      riskFactors.push('Severe obesity');
      riskClass = 'Substandard';
    } else if (bmi > 30) {
      riskFactors.push('Obesity');
      if (['SuperPreferredPlus', 'SuperPreferred'].includes(riskClass)) {
        riskClass = 'Standard';
      }
    } else if (bmi < 18.5) {
      riskFactors.push('Underweight');
      if (riskClass === 'SuperPreferredPlus') riskClass = 'Preferred';
    }

    // Nicotine use
    if (applicant.usesNicotine) {
      riskFactors.push('Nicotine use');
      if (['SuperPreferredPlus', 'SuperPreferred', 'PreferredPlus'].includes(riskClass)) {
        riskClass = 'Standard';
      }
    }

    return {
      riskClass,
      bmi: Math.round(bmi * 10) / 10,
      age,
      riskFactors
    };
  }

  private getBaseRate(riskClass: string, gender: string, age: number, termLength: number): number {
    // Simplified rate table - in production this would come from database
    const baseMaleRates: Record<string, number> = {
      'SuperPreferredPlus': 0.8,
      'SuperPreferred': 1.0,
      'PreferredPlus': 1.2,
      'Preferred': 1.5,
      'StandardPlus': 2.0,
      'Standard': 2.5,
      'Substandard': 4.0
    };

    let baseRate = baseMaleRates[riskClass] || 2.5;

    // Gender adjustment - females typically 10-15% lower
    if (gender === 'Female') {
      baseRate *= 0.875; // 12.5% lower
    }

    // Age adjustment
    const ageMultiplier = Math.pow(1.08, Math.max(0, age - 25));
    baseRate *= ageMultiplier;

    // Term length adjustment
    if (termLength === 20) {
      baseRate *= 1.2; // 20% higher for 20-year term
    }

    return baseRate;
  }

  private assessEligibility(age: number, bmi: number, usesNicotine: boolean): any {
    const declineReasons: string[] = [];
    let wouldDeclinePostUnderwriting = false;
    let requiresAdditionalUnderwriting = false;

    // Age-based decline
    if (age > 70) {
      wouldDeclinePostUnderwriting = true;
      declineReasons.push('Age exceeds maximum');
    }

    // BMI-based decline
    if (bmi > 40 || bmi < 16) {
      wouldDeclinePostUnderwriting = true;
      declineReasons.push('BMI outside acceptable range');
    }

    // High-risk combinations
    if (age > 65 && bmi > 30 && usesNicotine) {
      requiresAdditionalUnderwriting = true;
    }

    // Additional underwriting triggers
    if (age > 60 || bmi > 32 || bmi < 18) {
      requiresAdditionalUnderwriting = true;
    }

    return {
      wouldDeclinePostUnderwriting,
      requiresAdditionalUnderwriting,
      declineReasons: declineReasons.length > 0 ? declineReasons : undefined
    };
  }
}