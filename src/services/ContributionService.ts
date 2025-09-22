import {
  ContributionValidationRequest,
  ContributionValidationResponse,
  ContributionValidationResult,
  ContributionFrequency,
  CONTRIBUTION_MINIMUMS
} from '../types/contribution';

export class ContributionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_PRICING_SERVICE_URL || 'http://localhost:3001';
  }

  /**
   * Validate contribution amount and calculate equivalents
   */
  async validateContribution(request: ContributionValidationRequest): Promise<ContributionValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/contributions/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        // Fallback to local validation if backend is not available
        console.warn('Backend contribution validation failed, using local validation');
        return this.validateContributionLocally(request.amount, request.frequency);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return this.validateContributionLocally(request.amount, request.frequency);
      }

      const data: ContributionValidationResponse = await response.json();
      return data.validation;
    } catch (error) {
      console.warn('Contribution service error, using local validation:', error);
      return this.validateContributionLocally(request.amount, request.frequency);
    }
  }

  /**
   * Local fallback validation logic
   */
  private validateContributionLocally(amount: number, frequency: ContributionFrequency): ContributionValidationResult {
    const minimum = CONTRIBUTION_MINIMUMS[frequency];

    if (amount < minimum) {
      return {
        isValid: false,
        errorMessage: `Le montant minimum pour la fréquence ${frequency === 'monthly' ? 'mensuelle' :
                     frequency === 'quarterly' ? 'trimestrielle' :
                     frequency === 'bi-annual' ? 'semestrielle' : 'annuelle'} est de ${minimum.toLocaleString('fr-MA')} MAD.`,
        monthlyEquivalent: 0,
        annualTotal: 0,
      };
    }

    const { monthlyEquivalent, annualTotal } = this.calculateEquivalents(amount, frequency);

    return {
      isValid: true,
      monthlyEquivalent,
      annualTotal,
    };
  }

  /**
   * Calculate monthly equivalent and annual total
   */
  private calculateEquivalents(amount: number, frequency: ContributionFrequency): { monthlyEquivalent: number; annualTotal: number } {
    let monthlyEquivalent: number;
    let annualTotal: number;

    switch (frequency) {
      case 'monthly':
        monthlyEquivalent = amount;
        annualTotal = amount * 12;
        break;
      case 'quarterly':
        monthlyEquivalent = Math.round(amount / 3);
        annualTotal = amount * 4;
        break;
      case 'bi-annual':
        monthlyEquivalent = Math.round(amount / 6);
        annualTotal = amount * 2;
        break;
      case 'annual':
        monthlyEquivalent = Math.round(amount / 12);
        annualTotal = amount;
        break;
      default:
        throw new Error(`Unknown frequency: ${frequency}`);
    }

    return { monthlyEquivalent, annualTotal };
  }

  /**
   * Format currency in MAD
   */
  static formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-MA')} MAD`;
  }
}

// Singleton instance
export const contributionService = new ContributionService();