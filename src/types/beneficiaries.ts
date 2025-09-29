/**
 * TypeScript interfaces for beneficiaries management
 * Supports enrollment process and post-policy issuance
 */

export interface Beneficiary {
  id?: string; // UUID, optional for new beneficiaries
  enrollment_id?: string; // UUID reference to enrollments table
  policy_id?: string; // UUID reference to policies table (populated after issuance)

  // Personal Information
  last_name: string;
  first_name: string;
  cin?: string; // Optional National ID
  date_of_birth: string; // ISO date string
  place_of_birth: string; // City of birth
  address: string; // Current address

  // Allocation
  percentage: number; // 0-100, up to 2 decimal places
  order_index: number; // Display order (1-5)

  // Audit fields
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null; // Soft delete
}

export interface BeneficiaryFormData {
  id?: string;
  last_name: string;
  first_name: string;
  cin: string; // Empty string if not provided
  date_of_birth: string;
  place_of_birth: string;
  address: string;
  percentage: number | string; // Allow string for form input
  order_index: number;
  errors?: BeneficiaryFormErrors;
}

export interface BeneficiaryFormErrors {
  last_name?: string;
  first_name?: string;
  cin?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  address?: string;
  percentage?: string;
}

export interface BeneficiariesFormState {
  beneficiaries: BeneficiaryFormData[];
  totalPercentage: number;
  isValid: boolean;
  globalError?: string;
  isLoading: boolean;
  isSaving: boolean;
}

// API Request/Response interfaces

export interface CreateBeneficiariesRequest {
  enrollment_id: string;
  beneficiaries: Omit<Beneficiary, 'id' | 'enrollment_id' | 'created_at' | 'updated_at' | 'deleted_at'>[];
}

export interface UpdateBeneficiariesRequest {
  beneficiaries: (Partial<Beneficiary> & { id?: string; percentage: number })[];
}

export interface BeneficiariesResponse {
  success: boolean;
  data: Beneficiary[];
  totalPercentage: number;
  message?: string;
}

export interface DeleteBeneficiaryResponse {
  success: boolean;
  message: string;
  deletedId: string;
}

export interface ValidateBeneficiariesRequest {
  beneficiaries: { id?: string; percentage: number }[];
}

export interface ValidateBeneficiariesResponse {
  valid: boolean;
  totalPercentage: number;
  errors?: string[];
  details?: {
    isValidTotal: boolean;
    individualErrors: { [key: string]: string[] };
  };
}

// Form validation result
export interface BeneficiaryValidationResult {
  isValid: boolean;
  errors: BeneficiaryFormErrors;
}

export interface BeneficiariesValidationResult {
  isValid: boolean;
  beneficiaryErrors: BeneficiaryValidationResult[];
  totalPercentage: number;
  globalError: string | null;
}

// Enrollment context (for integration with existing enrollment flow)
export interface EnrollmentContextValue {
  enrollmentId: string | null;
  beneficiaries: BeneficiaryFormData[];
  setBeneficiaries: (beneficiaries: BeneficiaryFormData[]) => void;
  saveBeneficiaries: () => Promise<boolean>;
  isLoadingBeneficiaries: boolean;
}

// Constants
export const BENEFICIARIES_CONFIG = {
  MIN_BENEFICIARIES: 1,
  MAX_BENEFICIARIES: 5,
  REQUIRED_TOTAL_PERCENTAGE: 100,
  MAX_PERCENTAGE_DECIMAL_PLACES: 2,
} as const;

export const BENEFICIARY_FIELD_LABELS = {
  last_name: 'Nom',
  first_name: 'Prénom',
  cin: 'CIN (Optionnel)',
  date_of_birth: 'Date de naissance',
  place_of_birth: 'Lieu de naissance',
  address: 'Adresse',
  percentage: 'Pourcentage',
} as const;

export const BENEFICIARY_ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Ce champ est requis',
  INVALID_DATE: 'Date invalide',
  FUTURE_DATE: 'La date de naissance doit être dans le passé',
  INVALID_PERCENTAGE: 'Le pourcentage doit être entre 0 et 100',
  INVALID_TOTAL: 'Le total doit être exactement de 100%',
  MAX_BENEFICIARIES: 'Maximum 5 bénéficiaires autorisés',
  MIN_BENEFICIARIES: 'Au moins 1 bénéficiaire requis',
} as const;

// Utility type for creating new beneficiary
export type NewBeneficiary = Omit<Beneficiary, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

// Utility type for beneficiary updates
export type BeneficiaryUpdate = Partial<Beneficiary> & {
  id: string;
  percentage: number; // Always required for updates
};