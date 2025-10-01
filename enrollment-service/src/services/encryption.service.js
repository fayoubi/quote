import crypto from 'crypto';

class EncryptionService {
  constructor() {
    // TODO: Replace with proper key management (e.g., AWS KMS, HashiCorp Vault)
    this.algorithm = 'aes-256-gcm';
    this.key = process.env.ENCRYPTION_KEY
      ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
      : crypto.randomBytes(32);
    this.keyId = 'v1'; // Simple versioning
  }

  encrypt(data) {
    // TODO: Implement proper AES-256-GCM encryption
    // For now, use base64 encoding as placeholder
    const jsonString = JSON.stringify(data);
    const encoded = Buffer.from(jsonString).toString('base64');

    return {
      encrypted: encoded,
      keyId: this.keyId,
    };
  }

  decrypt(encryptedData, keyId) {
    // TODO: Implement proper decryption with key versioning
    const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
    return JSON.parse(decoded);
  }

  maskSensitiveData(data, fieldsToMask = []) {
    const masked = { ...data };
    fieldsToMask.forEach((field) => {
      if (masked[field]) {
        const value = masked[field];
        if (value.length > 4) {
          masked[field] = '****' + value.slice(-4);
        } else {
          masked[field] = '****';
        }
      }
    });
    return masked;
  }
}

export default new EncryptionService();