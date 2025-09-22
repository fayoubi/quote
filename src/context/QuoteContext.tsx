import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QuoteResponse } from '../types/pricing';

interface QuoteFormData {
  gender: 'male' | 'female';
  birthdate: string; // DD/MM/YYYY
  heightCm: string;
  weightKg: string;
  city: string;
  usesNicotine: boolean;
}

interface QuoteContextType {
  // Form data
  formData: QuoteFormData | null;
  setFormData: (data: QuoteFormData) => void;

  // Current quote
  currentQuote: QuoteResponse['quote'] | null;
  setCurrentQuote: (quote: QuoteResponse['quote'] | null) => void;

  // Loading states
  isCalculatingQuote: boolean;
  setIsCalculatingQuote: (loading: boolean) => void;

  // Error handling
  quoteError: string | null;
  setQuoteError: (error: string | null) => void;

  // Clear all data
  clearQuoteData: () => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
};

interface QuoteProviderProps {
  children: ReactNode;
}

export const QuoteProvider: React.FC<QuoteProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<QuoteFormData | null>(null);
  const [currentQuote, setCurrentQuote] = useState<QuoteResponse['quote'] | null>(null);
  const [isCalculatingQuote, setIsCalculatingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const clearQuoteData = () => {
    setFormData(null);
    setCurrentQuote(null);
    setIsCalculatingQuote(false);
    setQuoteError(null);
  };

  const value: QuoteContextType = {
    formData,
    setFormData,
    currentQuote,
    setCurrentQuote,
    isCalculatingQuote,
    setIsCalculatingQuote,
    quoteError,
    setQuoteError,
    clearQuoteData,
  };

  return (
    <QuoteContext.Provider value={value}>
      {children}
    </QuoteContext.Provider>
  );
};