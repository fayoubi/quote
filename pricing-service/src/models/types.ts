export enum ProductType {
  TERM_LIFE = 'term_life',
  WHOLE_LIFE = 'whole_life',
  ANNUITY = 'annuity'
}

export enum RiskClass {
  SUPER_PREFERRED_PLUS = 'SuperPreferredPlus',
  SUPER_PREFERRED = 'SuperPreferred',
  PREFERRED_PLUS = 'PreferredPlus',
  PREFERRED = 'Preferred',
  STANDARD_PLUS = 'StandardPlus',
  STANDARD = 'Standard',
  SUBSTANDARD = 'Substandard',
  UNINSURABLE = 'Uninsurable'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export interface Applicant {
  gender: Gender;
  birthDate: string; // ISO format YYYY-MM-DD
  height: number; // centimeters
  weight: number; // kilograms
  city: string;
  usesNicotine: boolean;
}

export interface Policy {
  termLength: number; // years
  coverageAmount: number; // dollars
}

export interface UniversalQuoteRequest {
  productType: ProductType;
  applicant: Applicant;
  policy: Policy;
}

export interface PricingResult {
  monthlyPremium: number;
  annualPremium: number;
}

export interface RiskAssessment {
  riskClass: RiskClass;
  bmi: number;
  age: number;
  riskFactors: string[];
}

export interface EligibilityFlags {
  wouldDeclinePostUnderwriting: boolean;
  requiresAdditionalUnderwriting: boolean;
  declineReasons?: string[];
}

export interface UniversalQuoteResponse {
  quote: {
    quoteId: string;
    productType: ProductType;
    pricing: PricingResult;
    riskAssessment: RiskAssessment;
    eligibilityFlags: EligibilityFlags;
    createdAt: Date;
    expiresAt: Date;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface Product {
  product_type: string;
  display_name: string;
  configuration: Record<string, any>;
  is_active: boolean;
}

export interface RateTable {
  product_type: string;
  risk_class: string;
  gender: string;
  age_min: number;
  age_max: number;
  term_length: number;
  rate_per_thousand: number;
}

export interface Quote {
  quote_id: string;
  product_type: string;
  applicant_data: Applicant;
  pricing_result: PricingResult;
  eligibility_flags: EligibilityFlags;
  created_at: Date;
  expires_at: Date;
}