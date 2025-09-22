import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Loader2, AlertCircle } from 'lucide-react';
import { useQuote } from '../context/QuoteContext';
import { pricingService, PricingService } from '../services/PricingService';

const QuoteDisplay: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    currentQuote,
    setCurrentQuote,
    quoteError,
    setQuoteError,
    prepopulationUtils
  } = useQuote();

  const [coverageYears, setCoverageYears] = useState<10 | 20>(20);
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [isUpdatingQuote, setIsUpdatingQuote] = useState(false);
  // Track if we've initialized the state to prevent resetting user selections
  const [isInitialized, setIsInitialized] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  // Redirect to form if no form data available
  useEffect(() => {
    if (!formData || !currentQuote) {
      navigate('/');
    }
  }, [formData, currentQuote, navigate]);

  // Initialize state from current quote (only on first load)
  // FIX: Prevents slider from resetting after each API update
  useEffect(() => {
    if (currentQuote && !isInitialized) {
      // Initialize with defaults on first load only
      // This prevents resetting user selections when new quotes arrive
      const initialCoverageAmount = 500000; // Start with default
      const initialTermLength = 20; // Start with 20-year term

      setCoverageAmount(initialCoverageAmount);
      setCoverageYears(initialTermLength);
      setIsInitialized(true);
    }
  }, [currentQuote, isInitialized]);

  const updateQuote = async (newCoverageAmount: number, newCoverageYears: 10 | 20) => {
    if (!formData) return;

    try {
      setIsUpdatingQuote(true);
      setQuoteError(null);

      // Convert form data to pricing request with new parameters
      const pricingRequest = PricingService.convertFormDataToPricingRequest(formData, {
        termLength: newCoverageYears,
        coverageAmount: newCoverageAmount
      });

      // Call pricing service
      const quoteResponse = await pricingService.calculateQuote(pricingRequest);
      setCurrentQuote(quoteResponse.quote);

    } catch (error) {
      console.error('Error updating quote:', error);
      setQuoteError(
        error instanceof Error
          ? error.message
          : 'Unable to update quote. Please try again.'
      );
    } finally {
      setIsUpdatingQuote(false);
    }
  };

  const handleCoverageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseInt(event.target.value);
    setCoverageAmount(newAmount);
    updateQuote(newAmount, coverageYears);
  };

  const handleYearsChange = (years: 10 | 20) => {
    setCoverageYears(years);
    updateQuote(coverageAmount, years);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-xl font-semibold text-primary-600 mx-auto">Your Quote</h1>
      </div>

      {/* Error Message */}
      {quoteError && (
        <div className="mx-4 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{quoteError}</span>
        </div>
      )}

      {/* Quote Amount */}
      <div className="text-center py-8 px-4">
        <div className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          {isUpdatingQuote ? (
            <div className="flex items-center">
              <Loader2 className="w-8 h-8 mr-3 animate-spin text-primary-600" />
              <span className="text-2xl">Updating...</span>
            </div>
          ) : currentQuote ? (
            `$${currentQuote.pricing.monthlyPremium.toFixed(2)}`
          ) : (
            '$--'
          )}
        </div>
        <div className="flex items-center justify-center text-gray-600">
          <span>Estimated Monthly Price</span>
          <Info className="w-4 h-4 ml-2 text-gray-400" />
        </div>
        {currentQuote && !isUpdatingQuote && (
          <div className="text-sm text-gray-500 mt-2">
            ${currentQuote.pricing.annualPremium.toFixed(2)} per year
          </div>
        )}
      </div>

      {/* Years of Coverage */}
      <div className="px-4 mb-6">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Years of Coverage
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleYearsChange(10)}
            disabled={isUpdatingQuote}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
              coverageYears === 10
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            10
          </button>
          <button
            onClick={() => handleYearsChange(20)}
            disabled={isUpdatingQuote}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
              coverageYears === 20
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            20
          </button>
        </div>
      </div>

      {/* Coverage Amount */}
      <div className="px-4 mb-8">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Coverage Amount
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-4">
          {formatCurrency(coverageAmount)}
        </div>
        
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min="250000"
            max="1500000"
            step="50000"
            value={coverageAmount}
            onChange={handleCoverageChange}
            disabled={isUpdatingQuote}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(coverageAmount - 250000) / (1500000 - 250000) * 100}%, #e5e7eb ${(coverageAmount - 250000) / (1500000 - 250000) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>$250K</span>
            <span>$1.5M</span>
          </div>
          {isUpdatingQuote && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 rounded-lg px-3 py-1 flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm text-gray-600">Updating...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Details */}
      {currentQuote && !isUpdatingQuote && (
        <div className="px-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Risk Class</span>
              <span className="text-sm font-medium text-gray-900">
                {currentQuote.riskAssessment.riskClass.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Age</span>
              <span className="text-sm font-medium text-gray-900">
                {currentQuote.riskAssessment.age} years
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">BMI</span>
              <span className="text-sm font-medium text-gray-900">
                {currentQuote.riskAssessment.bmi}
              </span>
            </div>
            {currentQuote.eligibilityFlags.requiresAdditionalUnderwriting && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Additional underwriting may be required
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Application Button */}
      <div className="px-4 pb-8">
        <button
          onClick={() => {
            // Store prepopulation data before navigating
            const prepopulationData = prepopulationUtils.createPrepopulationData(formData);
            prepopulationUtils.storePrepopulationData(prepopulationData);
            navigate('/enroll/start');
          }}
          className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
        >
          Start application
        </button>
      </div>
    </div>
  );
};

export default QuoteDisplay;
