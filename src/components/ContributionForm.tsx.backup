import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  ContributionFormData,
  ContributionFrequency,
  ContributionValidationResult,
  FREQUENCY_LABELS,
  CONTRIBUTION_MINIMUMS
} from '../types/contribution';
import { contributionService, ContributionService } from '../services/ContributionService';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import Label from './ui/Label';
import Select from './ui/Select';

const ContributionForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContributionFormData>({
    amount: 0,
    frequency: 'monthly'
  });
  const [validation, setValidation] = useState<ContributionValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  const validateContribution = useCallback(async () => {
    if (formData.amount <= 0) return;

    setIsValidating(true);
    try {
      const result = await contributionService.validateContribution({
        amount: formData.amount,
        frequency: formData.frequency
      });
      setValidation(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidation({
        isValid: false,
        errorMessage: 'Erreur lors de la validation. Veuillez réessayer.',
        monthlyEquivalent: 0,
        annualTotal: 0
      });
    } finally {
      setIsValidating(false);
    }
  }, [formData.amount, formData.frequency]);

  useEffect(() => {
    if (formData.amount > 0 && hasValidated) {
      validateContribution();
    }
  }, [formData.amount, formData.frequency, hasValidated, validateContribution]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, amount: value }));
    setShowConfirmation(false);
    if (!hasValidated && value > 0) {
      setHasValidated(true);
    }
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const frequency = e.target.value as ContributionFrequency;
    setFormData(prev => ({ ...prev, frequency }));
    setShowConfirmation(false);
  };

  const handleValidateClick = () => {
    setHasValidated(true);
    validateContribution();
  };

  const handleConfirm = () => {
    if (validation?.isValid) {
      setShowConfirmation(true);
    }
  };

  const handleProceed = () => {
    // Navigate to next step (TBD)
    console.log('Proceeding with contribution:', formData, validation);
    alert('Contribution confirmée! (Navigation vers la prochaine étape à implémenter)');
  };

  const getMinimumForCurrentFrequency = () => {
    return CONTRIBUTION_MINIMUMS[formData.frequency];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contribution Financière</h1>
          <p className="text-gray-600">Définissez votre montant et fréquence de cotisation</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">Étape 2 sur 3 - Contribution financière</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Détails de la Contribution</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="amount">
                  Montant de la cotisation (MAD) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="50"
                  value={formData.amount || ''}
                  onChange={handleAmountChange}
                  placeholder="Entrez le montant"
                  className={validation && !validation.isValid ? 'border-red-500' : ''}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Minimum: {getMinimumForCurrentFrequency().toLocaleString('fr-MA')} MAD pour la fréquence {FREQUENCY_LABELS[formData.frequency].toLowerCase()}
                </p>
              </div>

              <div>
                <Label htmlFor="frequency">
                  Fréquence de paiement *
                </Label>
                <Select
                  id="frequency"
                  value={formData.frequency}
                  onChange={handleFrequencyChange}
                >
                  {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  Choisissez la fréquence de vos paiements
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleValidateClick}
                disabled={isValidating || formData.amount <= 0}
                className="flex items-center gap-2"
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Validation...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Valider la Contribution
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Validation Result */}
          {validation && (
            <Card className={`p-6 ${validation.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-3">
                {validation.isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    {validation.isValid ? 'Contribution Validée' : 'Erreur de Validation'}
                  </h3>

                  {validation.isValid ? (
                    <div className="space-y-3">
                      <p className="text-green-700">
                        Votre contribution de {ContributionService.formatCurrency(formData.amount)} {FREQUENCY_LABELS[formData.frequency].toLowerCase()} a été validée.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-green-200">
                        <div>
                          <p className="text-sm text-gray-600">Équivalent mensuel:</p>
                          <p className="text-lg font-semibold text-green-800">
                            {ContributionService.formatCurrency(validation.monthlyEquivalent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total annuel:</p>
                          <p className="text-lg font-semibold text-green-800">
                            {ContributionService.formatCurrency(validation.annualTotal)}
                          </p>
                        </div>
                      </div>
                      {!showConfirmation && (
                        <Button
                          onClick={handleConfirm}
                          className="mt-4"
                        >
                          Confirmer cette Contribution
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-700">
                      {validation.errorMessage}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Confirmation Screen */}
          {showConfirmation && validation?.isValid && (
            <Card className="p-6 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    Confirmation de la Contribution
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Contribution:</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {ContributionService.formatCurrency(formData.amount)}
                        </p>
                        <p className="text-sm text-gray-500">{FREQUENCY_LABELS[formData.frequency]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Mensuel:</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {ContributionService.formatCurrency(validation.monthlyEquivalent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Annuel:</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {ContributionService.formatCurrency(validation.annualTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    Veuillez vérifier les détails ci-dessus avant de continuer.
                  </p>
                  <Button
                    onClick={handleProceed}
                    className="w-full"
                  >
                    Continuer vers l'Étape Suivante
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/enroll/start')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            {showConfirmation && validation?.isValid && (
              <Button
                onClick={handleProceed}
                className="flex items-center gap-2"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionForm;