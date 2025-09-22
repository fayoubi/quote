import { PricingRequest, QuoteResponse, ApiError } from '../types/pricing';

export class PricingService {
  private baseUrl: string;

  constructor() {
    // Default to local pricing service on port 3001, can be overridden via environment variable
    this.baseUrl = process.env.REACT_APP_PRICING_SERVICE_URL || 'http://localhost:3001';
  }

  /**
   * Calculate an insurance quote using the pricing service
   */
  async calculateQuote(request: PricingRequest): Promise<QuoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/quotes/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData: ApiError = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON (e.g., HTML error page), use status text
          console.warn('Non-JSON error response received:', jsonError);
        }
        throw new Error(errorMessage);
      }

      // Check if response is actually JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response, but received ${contentType || 'unknown content type'}`);
      }

      const data: QuoteResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Pricing service error:', error.message);
        throw error;
      }
      throw new Error('Unknown error occurred while calculating quote');
    }
  }

  /**
   * Get a previously calculated quote by ID
   */
  async getQuote(quoteId: string): Promise<QuoteResponse['quote']> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/quotes/${quoteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData: ApiError = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON (e.g., HTML error page), use status text
          console.warn('Non-JSON error response received:', jsonError);
        }
        throw new Error(errorMessage);
      }

      // Check if response is actually JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response, but received ${contentType || 'unknown content type'}`);
      }

      const data: { quote: QuoteResponse['quote'] } = await response.json();
      return data.quote;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Pricing service error:', error.message);
        throw error;
      }
      throw new Error('Unknown error occurred while retrieving quote');
    }
  }

  /**
   * Check if the pricing service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.warn('Pricing service health check failed:', error);
      return false;
    }
  }

  /**
   * Convert frontend form data to pricing service format
   */
  static convertFormDataToPricingRequest(formData: {
    gender: 'male' | 'female';
    birthdate: string; // DD/MM/YYYY
    heightCm: string;
    weightKg: string;
    city: string;
    usesNicotine: boolean;
  }, policy: {
    termLength: 10 | 20;
    coverageAmount: number;
  }): PricingRequest {
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = formData.birthdate.split('/');
    const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Convert gender format
    const gender = formData.gender === 'male' ? 'Male' : 'Female';

    return {
      productType: 'term_life',
      applicant: {
        gender,
        birthDate,
        height: parseInt(formData.heightCm),
        weight: parseInt(formData.weightKg),
        city: formData.city,
        usesNicotine: formData.usesNicotine,
      },
      policy,
    };
  }
}

// Singleton instance
export const pricingService = new PricingService();