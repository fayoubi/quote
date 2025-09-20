export interface PricingRequest {
  productType: 'term_life';
  applicant: {
    gender: 'Male' | 'Female';
    birthDate: string; // YYYY-MM-DD format
    height: number; // centimeters
    weight: number; // kilograms
    city: string;
    usesNicotine: boolean;
  };
  policy: {
    termLength: 10 | 20;
    coverageAmount: number; // dollars
  };
}

export interface PricingResult {
  monthlyPremium: number;
  annualPremium: number;
}

export interface RiskAssessment {
  riskClass: string;
  bmi: number;
  age: number;
  riskFactors: string[];
}

export interface EligibilityFlags {
  wouldDeclinePostUnderwriting: boolean;
  requiresAdditionalUnderwriting: boolean;
  declineReasons?: string[];
}

export interface QuoteResponse {
  quote: {
    quoteId: string;
    productType: 'term_life';
    pricing: PricingResult;
    riskAssessment: RiskAssessment;
    eligibilityFlags: EligibilityFlags;
    createdAt: string;
    expiresAt: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}