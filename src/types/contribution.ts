export type ContributionFrequency = 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
export type PaymentMode = 'check' | 'bank_draft';
export type FundOrigin = 'salary_savings' | 'property_sale' | 'securities_sale' | 'inheritance' | 'other';

export interface ContributionFormData {
  amount: number;
  frequency: ContributionFrequency;
}

export interface PaymentConfiguration {
  initialPayment: {
    amount: number;
    amountInText: string;
  };
  fundOrigins: {
    selected: FundOrigin[];
    otherDescription?: string;
  };
  paymentMode: {
    mode: PaymentMode;
    bankName: string;
    agencyName: string;
    checkNumber?: string;
    accountNumber?: string; // RIB for bank draft
  };
}

export interface EnhancedContributionFormData extends ContributionFormData {
  paymentConfig?: PaymentConfiguration;
}

export interface ContributionValidationResult {
  isValid: boolean;
  errorMessage?: string;
  monthlyEquivalent: number;
  annualTotal: number;
}

export interface ContributionValidationRequest {
  amount: number;
  frequency: ContributionFrequency;
}

export interface ContributionValidationResponse {
  validation: ContributionValidationResult;
}

export interface RIBValidationRequest {
  rib: string;
}

export interface RIBValidationResponse {
  valid: boolean;
  message?: string;
}

export const CONTRIBUTION_MINIMUMS: Record<ContributionFrequency, number> = {
  monthly: 250,
  quarterly: 750,
  'bi-annual': 1500,
  annual: 3000,
};

export const FREQUENCY_LABELS: Record<ContributionFrequency, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  'bi-annual': 'Semestriel',
  annual: 'Annuel',
};

export const FUND_ORIGIN_LABELS: Record<FundOrigin, string> = {
  salary_savings: 'Épargne sur les revenus annuels',
  property_sale: 'Vente d\'un bien immobilier',
  securities_sale: 'Vente de valeurs mobilières',
  inheritance: 'Héritage',
  other: 'Autre (précisez impérativement)',
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  check: 'Par chèque',
  bank_draft: 'Par prélèvement bancaire',
};