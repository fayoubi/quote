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

interface ApplicationPrepopulationData {
  dateOfBirth: string | null; // ISO date format (YYYY-MM-DD)
  city: string | null;
}

interface PrepopulationUtils {
  convertDateFormat: (ddmmyyyy: string) => string | null;
  createPrepopulationData: (formData: QuoteFormData | null) => ApplicationPrepopulationData;
  storePrepopulationData: (data: ApplicationPrepopulationData) => void;
  getPrepopulationData: () => ApplicationPrepopulationData;
  clearPrepopulationData: () => void;
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

  // Prepopulation utilities
  prepopulationUtils: PrepopulationUtils;

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

const PREPOPULATION_STORAGE_KEY = 'quote_prepopulation_data';

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

  // Prepopulation utility functions
  const convertDateFormat = (ddmmyyyy: string): string | null => {
    if (!ddmmyyyy || !ddmmyyyy.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return null;
    }

    try {
      const [day, month, year] = ddmmyyyy.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Validate the date is valid
      const dateObj = new Date(isoDate);
      if (dateObj.getFullYear() !== parseInt(year) ||
          dateObj.getMonth() !== parseInt(month) - 1 ||
          dateObj.getDate() !== parseInt(day)) {
        return null;
      }

      return isoDate;
    } catch {
      return null;
    }
  };

  const createPrepopulationData = (formData: QuoteFormData | null): ApplicationPrepopulationData => {
    if (!formData) {
      return { dateOfBirth: null, city: null };
    }

    return {
      dateOfBirth: convertDateFormat(formData.birthdate),
      city: formData.city || null
    };
  };

  const storePrepopulationData = (data: ApplicationPrepopulationData): void => {
    try {
      sessionStorage.setItem(PREPOPULATION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to store prepopulation data:', error);
    }
  };

  const getPrepopulationData = (): ApplicationPrepopulationData => {
    try {
      const stored = sessionStorage.getItem(PREPOPULATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          dateOfBirth: parsed.dateOfBirth || null,
          city: parsed.city || null
        };
      }
    } catch (error) {
      console.warn('Failed to retrieve prepopulation data:', error);
    }
    return { dateOfBirth: null, city: null };
  };

  const clearPrepopulationData = (): void => {
    try {
      sessionStorage.removeItem(PREPOPULATION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear prepopulation data:', error);
    }
  };

  const prepopulationUtils: PrepopulationUtils = {
    convertDateFormat,
    createPrepopulationData,
    storePrepopulationData,
    getPrepopulationData,
    clearPrepopulationData
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
    prepopulationUtils,
    clearQuoteData,
  };

  return (
    <QuoteContext.Provider value={value}>
      {children}
    </QuoteContext.Provider>
  );
};