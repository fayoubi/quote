import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';

const QuoteDisplay: React.FC = () => {
  const navigate = useNavigate();
  const [coverageYears, setCoverageYears] = useState<10 | 20>(20);
  const [coverageAmount, setCoverageAmount] = useState(1000000);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const handleCoverageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCoverageAmount(parseInt(event.target.value));
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

      {/* Quote Amount */}
      <div className="text-center py-8 px-4">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          $46.41
        </div>
        <div className="flex items-center justify-center text-gray-600">
          <span>Estimated Monthly Price</span>
          <Info className="w-4 h-4 ml-2 text-gray-400" />
        </div>
      </div>

      {/* Years of Coverage */}
      <div className="px-4 mb-6">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Years of Coverage
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setCoverageYears(10)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              coverageYears === 10
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            10
          </button>
          <button
            onClick={() => setCoverageYears(20)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
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
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(coverageAmount - 250000) / (1500000 - 250000) * 100}%, #e5e7eb ${(coverageAmount - 250000) / (1500000 - 250000) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>$250K</span>
            <span>$1.5M</span>
          </div>
        </div>
      </div>

      {/* Start Application Button */}
      <div className="px-4 pb-8">
        <button
          onClick={() => navigate('/enroll/start')}
          className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
        >
          Start application
        </button>
      </div>
    </div>
  );
};

export default QuoteDisplay;
