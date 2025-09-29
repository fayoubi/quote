import { RIBValidationRequest, RIBValidationResponse } from '../types/contribution';

export class RIBValidationService {
  private static readonly RIB_API_URL = 'https://rib.ma/api/validate-rib';

  /**
   * Validate RIB format (24 digits)
   */
  static isValidRIBFormat(rib: string): boolean {
    // Remove any spaces or special characters
    const cleanRIB = rib.replace(/\s|-/g, '');

    // Check if it's exactly 24 digits
    return /^\d{24}$/.test(cleanRIB);
  }

  /**
   * Format RIB for display (add spaces every 4 digits)
   */
  static formatRIB(rib: string): string {
    const cleanRIB = rib.replace(/\s|-/g, '');
    return cleanRIB.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * Clean RIB (remove spaces and dashes)
   */
  static cleanRIB(rib: string): string {
    return rib.replace(/\s|-/g, '');
  }

  /**
   * Validate RIB using external API
   */
  static async validateRIB(rib: string): Promise<RIBValidationResponse> {
    try {
      // First check format locally
      if (!this.isValidRIBFormat(rib)) {
        return {
          valid: false,
          message: 'Le RIB doit contenir exactement 24 chiffres'
        };
      }

      const cleanRIB = this.cleanRIB(rib);

      const response = await fetch(this.RIB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rib: cleanRIB
        } as RIBValidationRequest),
      });

      if (!response.ok) {
        // If API is down, fall back to basic format validation
        console.warn('RIB API unavailable, using basic format validation');
        return {
          valid: true,
          message: 'Format valide (API temporairement indisponible)'
        };
      }

      const result = await response.json();

      // Handle different possible response formats from the API
      if (typeof result.valid === 'boolean') {
        return result;
      } else if (result.success === true) {
        return { valid: true };
      } else if (result.success === false) {
        return {
          valid: false,
          message: result.message || 'RIB invalide'
        };
      } else {
        // Unknown response format, assume valid if we got this far
        return { valid: true };
      }
    } catch (error) {
      console.warn('RIB validation API error:', error);

      // Fallback to basic format validation if API fails
      return {
        valid: this.isValidRIBFormat(rib),
        message: this.isValidRIBFormat(rib)
          ? 'Format valide (validation API indisponible)'
          : 'Format invalide'
      };
    }
  }

  /**
   * Validate RIB with debouncing for real-time validation
   */
  static debounceValidation(callback: (result: RIBValidationResponse) => void, delay: number = 500) {
    let timeoutId: NodeJS.Timeout;

    return (rib: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const result = await this.validateRIB(rib);
        callback(result);
      }, delay);
    };
  }
}