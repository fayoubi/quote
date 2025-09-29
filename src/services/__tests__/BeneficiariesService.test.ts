import { BeneficiariesService } from '../BeneficiariesService';
import { BeneficiaryFormData } from '../../types/beneficiaries';

describe('BeneficiariesService', () => {
  let service: BeneficiariesService;

  beforeEach(() => {
    service = new BeneficiariesService();
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('createEmptyBeneficiary', () => {
    it('should create an empty beneficiary with correct order index', () => {
      const beneficiary = service.createEmptyBeneficiary(1);

      expect(beneficiary).toEqual({
        last_name: '',
        first_name: '',
        cin: '',
        date_of_birth: '',
        place_of_birth: '',
        address: '',
        percentage: '',
        order_index: 1,
      });
    });
  });

  describe('validateBeneficiary', () => {
    it('should pass validation for valid beneficiary', () => {
      const validBeneficiary: BeneficiaryFormData = {
        last_name: 'Doe',
        first_name: 'John',
        cin: 'AB123456',
        date_of_birth: '1990-01-01',
        place_of_birth: 'Casablanca',
        address: '123 Main St, Casablanca',
        percentage: 50,
        order_index: 1,
      };

      const result = service.validateBeneficiary(validBeneficiary);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation for empty required fields', () => {
      const invalidBeneficiary: BeneficiaryFormData = {
        last_name: '',
        first_name: '',
        cin: '',
        date_of_birth: '',
        place_of_birth: '',
        address: '',
        percentage: 0,
        order_index: 1,
      };

      const result = service.validateBeneficiary(invalidBeneficiary);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        last_name: 'Ce champ est requis',
        first_name: 'Ce champ est requis',
        date_of_birth: 'Ce champ est requis',
        place_of_birth: 'Ce champ est requis',
        address: 'Ce champ est requis',
        percentage: 'Le pourcentage doit être entre 0 et 100',
      });
    });

    it('should validate CIN as optional', () => {
      const beneficiaryWithoutCIN: BeneficiaryFormData = {
        last_name: 'Doe',
        first_name: 'John',
        cin: '', // Empty CIN should be valid
        date_of_birth: '1990-01-01',
        place_of_birth: 'Casablanca',
        address: '123 Main St, Casablanca',
        percentage: 50,
        order_index: 1,
      };

      const result = service.validateBeneficiary(beneficiaryWithoutCIN);

      expect(result.isValid).toBe(true);
      expect(result.errors.cin).toBeUndefined();
    });

    it('should fail validation for future date of birth', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const beneficiary: BeneficiaryFormData = {
        last_name: 'Doe',
        first_name: 'John',
        cin: '',
        date_of_birth: futureDate.toISOString().split('T')[0],
        place_of_birth: 'Casablanca',
        address: '123 Main St, Casablanca',
        percentage: 50,
        order_index: 1,
      };

      const result = service.validateBeneficiary(beneficiary);

      expect(result.isValid).toBe(false);
      expect(result.errors.date_of_birth).toBe('La date de naissance doit être dans le passé');
    });

    it('should fail validation for invalid percentage', () => {
      const testCases = [
        { percentage: -10, expected: 'Le pourcentage doit être entre 0 et 100' },
        { percentage: 150, expected: 'Le pourcentage doit être entre 0 et 100' },
        { percentage: 0, expected: 'Le pourcentage doit être entre 0 et 100' },
      ];

      testCases.forEach(({ percentage, expected }) => {
        const beneficiary: BeneficiaryFormData = {
          last_name: 'Doe',
          first_name: 'John',
          cin: '',
          date_of_birth: '1990-01-01',
          place_of_birth: 'Casablanca',
          address: '123 Main St, Casablanca',
          percentage,
          order_index: 1,
        };

        const result = service.validateBeneficiary(beneficiary);
        expect(result.errors.percentage).toBe(expected);
      });
    });
  });

  describe('validateBeneficiariesForm', () => {
    it('should pass validation for exactly 100% total', () => {
      const beneficiaries: BeneficiaryFormData[] = [
        {
          last_name: 'Doe',
          first_name: 'John',
          cin: '',
          date_of_birth: '1990-01-01',
          place_of_birth: 'Casablanca',
          address: '123 Main St',
          percentage: 60,
          order_index: 1,
        },
        {
          last_name: 'Smith',
          first_name: 'Jane',
          cin: '',
          date_of_birth: '1985-06-15',
          place_of_birth: 'Rabat',
          address: '456 Oak Ave',
          percentage: 40,
          order_index: 2,
        },
      ];

      const result = service.validateBeneficiariesForm(beneficiaries);

      expect(result.isValid).toBe(true);
      expect(result.totalPercentage).toBe(100);
      expect(result.globalError).toBe(null);
    });

    it('should fail validation for total less than 100%', () => {
      const beneficiaries: BeneficiaryFormData[] = [
        {
          last_name: 'Doe',
          first_name: 'John',
          cin: '',
          date_of_birth: '1990-01-01',
          place_of_birth: 'Casablanca',
          address: '123 Main St',
          percentage: 30,
          order_index: 1,
        },
        {
          last_name: 'Smith',
          first_name: 'Jane',
          cin: '',
          date_of_birth: '1985-06-15',
          place_of_birth: 'Rabat',
          address: '456 Oak Ave',
          percentage: 40,
          order_index: 2,
        },
      ];

      const result = service.validateBeneficiariesForm(beneficiaries);

      expect(result.isValid).toBe(false);
      expect(result.totalPercentage).toBe(70);
      expect(result.globalError).toBe('Le total doit être exactement de 100%. Actuellement: 70.00%');
    });

    it('should fail validation for total greater than 100%', () => {
      const beneficiaries: BeneficiaryFormData[] = [
        {
          last_name: 'Doe',
          first_name: 'John',
          cin: '',
          date_of_birth: '1990-01-01',
          place_of_birth: 'Casablanca',
          address: '123 Main St',
          percentage: 70,
          order_index: 1,
        },
        {
          last_name: 'Smith',
          first_name: 'Jane',
          cin: '',
          date_of_birth: '1985-06-15',
          place_of_birth: 'Rabat',
          address: '456 Oak Ave',
          percentage: 40,
          order_index: 2,
        },
      ];

      const result = service.validateBeneficiariesForm(beneficiaries);

      expect(result.isValid).toBe(false);
      expect(result.totalPercentage).toBe(110);
      expect(result.globalError).toBe('Le total doit être exactement de 100%. Actuellement: 110.00%');
    });

    it('should handle decimal percentages correctly', () => {
      const beneficiaries: BeneficiaryFormData[] = [
        {
          last_name: 'Doe',
          first_name: 'John',
          cin: '',
          date_of_birth: '1990-01-01',
          place_of_birth: 'Casablanca',
          address: '123 Main St',
          percentage: 33.33,
          order_index: 1,
        },
        {
          last_name: 'Smith',
          first_name: 'Jane',
          cin: '',
          date_of_birth: '1985-06-15',
          place_of_birth: 'Rabat',
          address: '456 Oak Ave',
          percentage: 33.33,
          order_index: 2,
        },
        {
          last_name: 'Brown',
          first_name: 'Bob',
          cin: '',
          date_of_birth: '1992-03-20',
          place_of_birth: 'Fes',
          address: '789 Pine St',
          percentage: 33.34,
          order_index: 3,
        },
      ];

      const result = service.validateBeneficiariesForm(beneficiaries);

      expect(result.isValid).toBe(true);
      expect(result.totalPercentage).toBe(100);
      expect(result.globalError).toBe(null);
    });
  });

  describe('calculateEqualDistribution', () => {
    it('should calculate equal distribution for 2 beneficiaries', () => {
      const result = service.calculateEqualDistribution(2);
      expect(result).toEqual([50, 50]);
    });

    it('should calculate equal distribution for 3 beneficiaries', () => {
      const result = service.calculateEqualDistribution(3);
      expect(result).toEqual([33.34, 33.33, 33.33]);
    });

    it('should calculate equal distribution for 5 beneficiaries', () => {
      const result = service.calculateEqualDistribution(5);
      expect(result).toEqual([20, 20, 20, 20, 20]);
    });

    it('should return empty array for 0 beneficiaries', () => {
      const result = service.calculateEqualDistribution(0);
      expect(result).toEqual([]);
    });

    it('should handle uneven division properly', () => {
      const result = service.calculateEqualDistribution(7);
      // 100 / 7 = 14.285714...
      // Floor to 2 decimals = 14.28
      // 7 * 14.28 = 99.96
      // Remainder = 0.04 goes to first beneficiary
      expect(result[0]).toBeCloseTo(14.32);
      expect(result.slice(1)).toEqual([14.28, 14.28, 14.28, 14.28, 14.28, 14.28]);

      const total = result.reduce((sum, val) => sum + val, 0);
      expect(total).toBe(100);
    });
  });

  describe('formatPercentage', () => {
    it('should format numbers to 2 decimal places', () => {
      expect(service.formatPercentage(50)).toBe('50.00');
      expect(service.formatPercentage(33.333)).toBe('33.33');
      expect(service.formatPercentage(0)).toBe('0.00');
    });

    it('should handle string inputs', () => {
      expect(service.formatPercentage('50')).toBe('50.00');
      expect(service.formatPercentage('33.333')).toBe('33.33');
      expect(service.formatPercentage('')).toBe('0.00');
      expect(service.formatPercentage('invalid')).toBe('0.00');
    });
  });

  describe('saveBeneficiaries', () => {
    it('should save valid beneficiaries to localStorage', async () => {
      const enrollmentId = 'test-enrollment-123';
      const beneficiaries: BeneficiaryFormData[] = [
        {
          last_name: 'Doe',
          first_name: 'John',
          cin: 'AB123456',
          date_of_birth: '1990-01-01',
          place_of_birth: 'Casablanca',
          address: '123 Main St',
          percentage: 100,
          order_index: 1,
        },
      ];

      const result = await service.saveBeneficiaries(enrollmentId, beneficiaries);

      expect(result.success).toBe(true);
      expect(result.totalPercentage).toBe(100);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        last_name: 'Doe',
        first_name: 'John',
        cin: 'AB123456',
        percentage: 100,
        order_index: 1,
      });

      // Check localStorage
      const stored = localStorage.getItem(`beneficiaries_${enrollmentId}`);
      expect(stored).not.toBe(null);
      const parsedStored = JSON.parse(stored!);
      expect(parsedStored.success).toBe(true);
    });

    it('should reject invalid beneficiaries', async () => {
      const enrollmentId = 'test-enrollment-123';
      const invalidBeneficiaries: BeneficiaryFormData[] = [
        {
          last_name: '',
          first_name: '',
          cin: '',
          date_of_birth: '',
          place_of_birth: '',
          address: '',
          percentage: 50, // Only 50%, not 100%
          order_index: 1,
        },
      ];

      const result = await service.saveBeneficiaries(enrollmentId, invalidBeneficiaries);

      expect(result.success).toBe(false);
      expect(result.message).toContain('50.00%');
    });
  });

  describe('getBeneficiariesForEnrollment', () => {
    it('should return empty array when no beneficiaries exist', async () => {
      const enrollmentId = 'non-existent-enrollment';

      const result = await service.getBeneficiariesForEnrollment(enrollmentId);

      expect(result).toEqual([]);
    });

    it('should return saved beneficiaries', async () => {
      const enrollmentId = 'test-enrollment-with-data';
      const mockData = {
        success: true,
        beneficiaries: [
          {
            id: 'ben-123',
            last_name: 'Doe',
            first_name: 'John',
            percentage: 100,
            order_index: 1,
          },
        ],
      };

      localStorage.setItem(`beneficiaries_${enrollmentId}`, JSON.stringify(mockData));

      const result = await service.getBeneficiariesForEnrollment(enrollmentId);

      expect(result).toEqual(mockData.beneficiaries);
    });
  });

  describe('validatePercentageAllocation', () => {
    it('should validate correct percentage allocation', async () => {
      const beneficiaries = [
        { id: 'ben-1', percentage: 40 },
        { id: 'ben-2', percentage: 35 },
        { id: 'ben-3', percentage: 25 },
      ];

      const result = await service.validatePercentageAllocation('enrollment-123', beneficiaries);

      expect(result.valid).toBe(true);
      expect(result.totalPercentage).toBe(100);
      expect(result.errors).toBeUndefined();
    });

    it('should reject incorrect percentage allocation', async () => {
      const beneficiaries = [
        { id: 'ben-1', percentage: 40 },
        { id: 'ben-2', percentage: 35 },
        { id: 'ben-3', percentage: 30 }, // Total = 105%
      ];

      const result = await service.validatePercentageAllocation('enrollment-123', beneficiaries);

      expect(result.valid).toBe(false);
      expect(result.totalPercentage).toBe(105);
      expect(result.errors?.[0]).toContain('105.00%');
    });

    it('should handle floating point precision', async () => {
      const beneficiaries = [
        { percentage: 33.33 },
        { percentage: 33.33 },
        { percentage: 33.34 },
      ];

      const result = await service.validatePercentageAllocation('enrollment-123', beneficiaries);

      expect(result.valid).toBe(true);
      expect(result.totalPercentage).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle beneficiary with all optional fields empty except required ones', () => {
      const beneficiary: BeneficiaryFormData = {
        last_name: 'Doe',
        first_name: 'John',
        cin: '', // Optional
        date_of_birth: '1990-01-01',
        place_of_birth: 'Casablanca',
        address: '123 Main St',
        percentage: 100,
        order_index: 1,
      };

      const result = service.validateBeneficiary(beneficiary);
      expect(result.isValid).toBe(true);
    });

    it('should handle trimming whitespace in validation', () => {
      const beneficiary: BeneficiaryFormData = {
        last_name: '  Doe  ',
        first_name: '  John  ',
        cin: '  AB123456  ',
        date_of_birth: '1990-01-01',
        place_of_birth: '  Casablanca  ',
        address: '  123 Main St  ',
        percentage: 100,
        order_index: 1,
      };

      const result = service.validateBeneficiary(beneficiary);
      expect(result.isValid).toBe(true);
    });

    it('should reject beneficiary with only whitespace in required fields', () => {
      const beneficiary: BeneficiaryFormData = {
        last_name: '   ',
        first_name: '   ',
        cin: '',
        date_of_birth: '1990-01-01',
        place_of_birth: '   ',
        address: '   ',
        percentage: 100,
        order_index: 1,
      };

      const result = service.validateBeneficiary(beneficiary);
      expect(result.isValid).toBe(false);
      expect(result.errors.last_name).toBe('Ce champ est requis');
      expect(result.errors.first_name).toBe('Ce champ est requis');
      expect(result.errors.place_of_birth).toBe('Ce champ est requis');
      expect(result.errors.address).toBe('Ce champ est requis');
    });
  });
});