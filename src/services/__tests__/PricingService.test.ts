import { PricingService } from '../PricingService';

// Mock fetch globally
global.fetch = jest.fn();

describe('PricingService', () => {
  let pricingService: PricingService;

  beforeEach(() => {
    // Reset mocks before each test
    (fetch as jest.Mock).mockClear();
    pricingService = new PricingService();
  });

  describe('calculateQuote', () => {
    const mockRequest = {
      productType: 'term_life' as const,
      applicant: {
        gender: 'Male' as const,
        birthDate: '1990-01-15',
        height: 180,
        weight: 75,
        city: 'New York',
        usesNicotine: false,
      },
      policy: {
        termLength: 20 as const,
        coverageAmount: 500000,
      },
    };

    it('should successfully calculate quote with valid JSON response', async () => {
      const mockResponse = {
        quote: {
          id: 'quote_123',
          status: 'active',
          pricing: {
            monthlyPremium: 45.50,
            annualPremium: 546.00,
            currency: 'USD'
          },
          policy: {
            termLength: 20,
            coverageAmount: 500000,
            productType: 'term_life'
          },
          riskAssessment: {
            riskClass: 'Standard',
            age: 34,
            bmi: 23.1
          },
          eligibilityFlags: {
            requiresAdditionalUnderwriting: false,
            eligible: true
          },
          expiresAt: '2024-10-22T14:51:13.587Z',
          createdAt: '2024-09-22T14:51:13.587Z'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await pricingService.calculateQuote(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/quotes/calculate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockRequest),
        })
      );
    });

    it('should handle HTML error response (regression test for JSON parsing bug)', async () => {
      // Simulate receiving HTML instead of JSON (the original bug)
      const htmlResponse = '<!DOCTYPE html><html><head><title>Error</title></head><body>Internal Server Error</body></html>';

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
        json: jest.fn().mockRejectedValueOnce(new Error('Unexpected token \'<\', \"<!DOCTYPE \"... is not valid JSON')),
      });

      await expect(pricingService.calculateQuote(mockRequest)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );

      // Verify that the error doesn't crash with JSON parsing error
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle non-JSON success response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
        json: jest.fn().mockResolvedValueOnce({}),
      });

      await expect(pricingService.calculateQuote(mockRequest)).rejects.toThrow(
        'Expected JSON response, but received text/html'
      );
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(pricingService.calculateQuote(mockRequest)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle server error with JSON response', async () => {
      const errorResponse = {
        error: 'VALIDATION_ERROR',
        message: 'Invalid applicant data'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValueOnce(errorResponse),
      });

      await expect(pricingService.calculateQuote(mockRequest)).rejects.toThrow(
        'Invalid applicant data'
      );
    });

    it('should handle server error without JSON response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          get: jest.fn().mockReturnValue('text/plain'),
        },
        json: jest.fn().mockRejectedValueOnce(new Error('Not JSON')),
      });

      await expect(pricingService.calculateQuote(mockRequest)).rejects.toThrow(
        'HTTP 503: Service Unavailable'
      );
    });
  });

  describe('convertFormDataToPricingRequest', () => {
    it('should correctly convert form data to pricing request format', () => {
      const formData = {
        gender: 'female' as const,
        birthdate: '15/01/1990', // DD/MM/YYYY format
        heightCm: '165',
        weightKg: '60',
        city: 'Paris',
        usesNicotine: true,
      };

      const policy = {
        termLength: 10 as const,
        coverageAmount: 750000,
      };

      const result = PricingService.convertFormDataToPricingRequest(formData, policy);

      expect(result).toEqual({
        productType: 'term_life',
        applicant: {
          gender: 'Female',
          birthDate: '1990-01-15', // Converted to ISO format
          height: 165,
          weight: 60,
          city: 'Paris',
          usesNicotine: true,
        },
        policy: {
          termLength: 10,
          coverageAmount: 750000,
        },
      });
    });
  });

  describe('healthCheck', () => {
    it('should return true for successful health check', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const result = await pricingService.healthCheck();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/health',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should return false for failed health check', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const result = await pricingService.healthCheck();

      expect(result).toBe(false);
    });

    it('should return false for network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await pricingService.healthCheck();

      expect(result).toBe(false);
    });
  });
});