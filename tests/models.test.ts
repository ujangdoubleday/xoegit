import { describe, it, expect } from 'vitest';
import {
  GEMINI_MODELS,
  DEFAULT_MODEL,
  getModelName,
  getAvailableModels,
  getModelList,
} from '../src/providers/models.js';

describe('Models', () => {
  describe('GEMINI_MODELS', () => {
    it('should have flash-lite model', () => {
      expect(GEMINI_MODELS['flash-lite']).toBe('gemini-2.5-flash-lite');
    });

    it('should have flash model', () => {
      expect(GEMINI_MODELS['flash']).toBe('gemini-2.5-flash');
    });

    it('should have flash-3 model', () => {
      expect(GEMINI_MODELS['flash-3']).toBe('gemini-3-flash');
    });
  });

  describe('DEFAULT_MODEL', () => {
    it('should be a valid model key', () => {
      expect(DEFAULT_MODEL in GEMINI_MODELS).toBe(true);
    });
  });

  describe('getModelName', () => {
    it('should return correct model for valid key', () => {
      expect(getModelName('flash')).toBe('gemini-2.5-flash');
      expect(getModelName('flash-lite')).toBe('gemini-2.5-flash-lite');
      expect(getModelName('flash-3')).toBe('gemini-3-flash');
    });

    it('should return default model for invalid key', () => {
      expect(getModelName('invalid')).toBe(GEMINI_MODELS[DEFAULT_MODEL]);
    });

    it('should return default model for undefined', () => {
      expect(getModelName(undefined)).toBe(GEMINI_MODELS[DEFAULT_MODEL]);
    });
  });

  describe('getAvailableModels', () => {
    it('should return array of model keys', () => {
      const models = getAvailableModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toContain('flash-lite');
      expect(models).toContain('flash');
      expect(models).toContain('flash-3');
    });
  });

  describe('getModelList', () => {
    it('should return array of model names', () => {
      const models = getModelList();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(3);
    });

    it('should have default model first', () => {
      const models = getModelList();
      expect(models[0]).toBe(GEMINI_MODELS[DEFAULT_MODEL]);
    });

    it('should contain all models', () => {
      const models = getModelList();
      expect(models).toContain('gemini-2.5-flash-lite');
      expect(models).toContain('gemini-2.5-flash');
      expect(models).toContain('gemini-3-flash');
    });
  });
});
