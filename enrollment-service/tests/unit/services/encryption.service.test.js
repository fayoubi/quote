import encryptionService from '../../../src/services/encryption.service.js';

describe('EncryptionService', () => {
  describe('encrypt', () => {
    it('should encrypt data', () => {
      const data = { sensitive: 'information' };
      const result = encryptionService.encrypt(data);

      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('keyId');
      expect(result.keyId).toBe('v1');
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data', () => {
      const data = { sensitive: 'information' };
      const { encrypted, keyId } = encryptionService.encrypt(data);
      const decrypted = encryptionService.decrypt(encrypted, keyId);

      expect(decrypted).toEqual(data);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask specified fields', () => {
      const data = {
        cardNumber: '4242424242424242',
        cvv: '123',
        name: 'John Doe',
      };

      const masked = encryptionService.maskSensitiveData(data, ['cardNumber', 'cvv']);

      expect(masked.cardNumber).toBe('****4242');
      expect(masked.cvv).toBe('****');
      expect(masked.name).toBe('John Doe');
    });

    it('should handle short values', () => {
      const data = { pin: '12' };
      const masked = encryptionService.maskSensitiveData(data, ['pin']);

      expect(masked.pin).toBe('****');
    });
  });
});