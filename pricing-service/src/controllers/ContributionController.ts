import { Request, Response } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger.js';

interface ContributionValidationRequest {
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
}

interface ContributionValidationResult {
  isValid: boolean;
  errorMessage?: string;
  monthlyEquivalent: number;
  annualTotal: number;
}

const CONTRIBUTION_MINIMUMS: Record<string, number> = {
  monthly: 250,
  quarterly: 750,
  'bi-annual': 1500,
  annual: 3000,
};

export class ContributionController {
  /**
   * Validate contribution amount and calculate equivalents
   */
  static async validateContribution(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body with Joi
      const schema = Joi.object({
        amount: Joi.number().positive().required(),
        frequency: Joi.string().valid('monthly', 'quarterly', 'bi-annual', 'annual').required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(detail => detail.message)
        });
        return;
      }

      const { amount, frequency }: ContributionValidationRequest = value;

      logger.info('Processing contribution validation', { amount, frequency });

      const validation = ContributionController.calculateContribution(amount, frequency);

      logger.info('Contribution validation completed', {
        isValid: validation.isValid,
        monthlyEquivalent: validation.monthlyEquivalent,
        annualTotal: validation.annualTotal
      });

      res.json({
        validation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error validating contribution:', error);
      res.status(500).json({
        error: 'Internal server error during contribution validation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate contribution validation and equivalents
   */
  private static calculateContribution(amount: number, frequency: string): ContributionValidationResult {
    const minimum = CONTRIBUTION_MINIMUMS[frequency];

    if (!minimum) {
      return {
        isValid: false,
        errorMessage: `Fréquence invalide: ${frequency}`,
        monthlyEquivalent: 0,
        annualTotal: 0,
      };
    }

    if (amount < minimum) {
      const frequencyLabel = {
        monthly: 'mensuelle',
        quarterly: 'trimestrielle',
        'bi-annual': 'semestrielle',
        annual: 'annuelle'
      }[frequency] || frequency;

      return {
        isValid: false,
        errorMessage: `Le montant minimum pour la fréquence ${frequencyLabel} est de ${minimum.toLocaleString('fr-MA')} MAD.`,
        monthlyEquivalent: 0,
        annualTotal: 0,
      };
    }

    const { monthlyEquivalent, annualTotal } = ContributionController.calculateEquivalents(amount, frequency);

    return {
      isValid: true,
      monthlyEquivalent,
      annualTotal,
    };
  }

  /**
   * Calculate monthly equivalent and annual total
   */
  private static calculateEquivalents(amount: number, frequency: string): { monthlyEquivalent: number; annualTotal: number } {
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
}

// No longer needed with Joi validation