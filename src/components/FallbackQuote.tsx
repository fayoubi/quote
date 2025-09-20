import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FallbackQuoteProps {
  onRetry: () => void;
  isRetrying: boolean;
}

const FallbackQuote: React.FC<FallbackQuoteProps> = ({ onRetry, isRetrying }) => {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Calculate Quote
          </h2>
          <p className="text-gray-600 mb-4">
            Our pricing service is temporarily unavailable. Please try again in a moment.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              In the meantime, here's an estimated range:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                $35 - $65
              </div>
              <div className="text-sm text-gray-600">
                Estimated monthly premium range for term life insurance
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackQuote;