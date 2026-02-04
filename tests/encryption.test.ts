import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, isEncrypted } from '../src/config/encryption.js';

describe('Encryption Utils', () => {
  const testApiKey = 'AIzaSyAbcdefghijklmnopqrstuvwxyz12345';

  describe('isEncrypted', () => {
    it('should return true for encrypted values', () => {
      const encrypted = encrypt(testApiKey);
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plain text values', () => {
      expect(isEncrypted(testApiKey)).toBe(false);
      expect(isEncrypted('')).toBe(false);
      expect(isEncrypted('some-random-key')).toBe(false);
    });

    it('should return false for values with partial prefix', () => {
      expect(isEncrypted('enc:')).toBe(false);
      expect(isEncrypted('enc:v')).toBe(false);
    });
  });

  describe('encrypt', () => {
    it('should produce encrypted format with correct prefix', () => {
      const encrypted = encrypt(testApiKey);
      expect(encrypted.startsWith('enc:v1:')).toBe(true);
    });

    it('should produce different outputs for same input (random IV)', () => {
      const encrypted1 = encrypt(testApiKey);
      const encrypted2 = encrypt(testApiKey);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should produce output with correct format structure', () => {
      const encrypted = encrypt(testApiKey);
      const parts = encrypted.replace('enc:v1:', '').split(':');
      expect(parts.length).toBe(3); // iv:authTag:ciphertext
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted value back to original', () => {
      const encrypted = encrypt(testApiKey);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(testApiKey);
    });

    it('should throw for non-encrypted values', () => {
      expect(() => decrypt(testApiKey)).toThrow('Value is not encrypted');
    });

    it('should throw for invalid encrypted format', () => {
      expect(() => decrypt('enc:v1:invalid')).toThrow('Invalid encrypted format');
    });
  });

  describe('round-trip', () => {
    it('should correctly encrypt and decrypt various API keys', () => {
      const keys = [
        'AIzaSyAbcdefghijklmnopqrstuvwxyz12345',
        'sk-1234567890abcdefABCDEF',
        'test_key_with_underscores_and-dashes',
        'a'.repeat(100), // long key
      ];

      for (const key of keys) {
        const encrypted = encrypt(key);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(key);
      }
    });
  });
});
