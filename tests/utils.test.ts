import { describe, it, expect } from 'vitest';
import { isValidApiKey } from '../src/utils/input.js';

describe('Input Utils', () => {
  describe('isValidApiKey', () => {
    it('should return true for valid API key', () => {
      expect(isValidApiKey('AIzaSyAbcdefghijklmnopqrstuvwxyz12345')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidApiKey('')).toBe(false);
    });

    it('should return false for short strings', () => {
      expect(isValidApiKey('short')).toBe(false);
    });

    it('should return false for strings with spaces', () => {
      expect(isValidApiKey('has spaces in it')).toBe(false);
    });

    it('should return false for non-ASCII characters', () => {
      expect(isValidApiKey('⚙️invalid_key_with_emoji')).toBe(false);
    });

    it('should return true for alphanumeric with dashes and underscores', () => {
      expect(isValidApiKey('Valid_Key-123_ABC')).toBe(true);
    });
  });
});
