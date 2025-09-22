export type ContributionFrequency = 'monthly' | 'quarterly' | 'bi-annual' | 'annual';

export interface ContributionFormData {
  amount: number;
  frequency: ContributionFrequency;
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