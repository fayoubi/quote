import { ProductType } from '../models/types.js';
export class PricingEngineFactory {
    static createEngine(productType) {
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
export class TermLifePricingEngine {
    validateInputs(request) {
        const errors = [];
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
    async calculateQuote(request) {
        const validation = this.validateInputs(request);
        if (!validation.isValid) {
            throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
        }
        const birthDate = new Date(request.applicant.birthDate);
        const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const heightInMeters = request.applicant.height / 100;
        const bmi = request.applicant.weight / (heightInMeters * heightInMeters);
        const riskAssessment = this.assessRisk(request.applicant, age, bmi);
        const baseRate = this.getBaseRate(riskAssessment.riskClass, request.applicant.gender, age, request.policy.termLength);
        let adjustedRate = baseRate;
        if (request.applicant.usesNicotine) {
            adjustedRate *= 1.75;
        }
        if (request.policy.coverageAmount >= 1000000) {
            adjustedRate *= 0.9;
        }
        else if (request.policy.coverageAmount >= 500000) {
            adjustedRate *= 0.95;
        }
        const annualPremium = (request.policy.coverageAmount / 1000) * adjustedRate;
        const monthlyPremium = annualPremium / 12;
        const eligibilityFlags = this.assessEligibility(age, bmi, request.applicant.usesNicotine);
        const quoteId = `quote_term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + (720 * 60 * 60 * 1000));
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
    assessRisk(applicant, age, bmi) {
        const riskFactors = [];
        let riskClass = 'SuperPreferredPlus';
        if (age > 65) {
            riskFactors.push('Advanced age');
            riskClass = 'Standard';
        }
        else if (age > 55) {
            riskFactors.push('Elevated age');
            if (riskClass === 'SuperPreferredPlus')
                riskClass = 'Preferred';
        }
        if (bmi > 35) {
            riskFactors.push('Severe obesity');
            riskClass = 'Substandard';
        }
        else if (bmi > 30) {
            riskFactors.push('Obesity');
            if (['SuperPreferredPlus', 'SuperPreferred'].includes(riskClass)) {
                riskClass = 'Standard';
            }
        }
        else if (bmi < 18.5) {
            riskFactors.push('Underweight');
            if (riskClass === 'SuperPreferredPlus')
                riskClass = 'Preferred';
        }
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
    getBaseRate(riskClass, gender, age, termLength) {
        const baseMaleRates = {
            'SuperPreferredPlus': 0.8,
            'SuperPreferred': 1.0,
            'PreferredPlus': 1.2,
            'Preferred': 1.5,
            'StandardPlus': 2.0,
            'Standard': 2.5,
            'Substandard': 4.0
        };
        let baseRate = baseMaleRates[riskClass] || 2.5;
        if (gender === 'Female') {
            baseRate *= 0.875;
        }
        const ageMultiplier = Math.pow(1.08, Math.max(0, age - 25));
        baseRate *= ageMultiplier;
        if (termLength === 20) {
            baseRate *= 1.2;
        }
        return baseRate;
    }
    assessEligibility(age, bmi, usesNicotine) {
        const declineReasons = [];
        let wouldDeclinePostUnderwriting = false;
        let requiresAdditionalUnderwriting = false;
        if (age > 70) {
            wouldDeclinePostUnderwriting = true;
            declineReasons.push('Age exceeds maximum');
        }
        if (bmi > 40 || bmi < 16) {
            wouldDeclinePostUnderwriting = true;
            declineReasons.push('BMI outside acceptable range');
        }
        if (age > 65 && bmi > 30 && usesNicotine) {
            requiresAdditionalUnderwriting = true;
        }
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
//# sourceMappingURL=PricingEngine.js.map