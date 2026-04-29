import { describe, it, expect } from 'vitest';
import {
  GEMINI_MODELS,
  getDefaultModel,
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

  describe('getDefaultModel', () => {
    it('should return default gemini model', () => {
      expect(getDefaultModel('gemini')).toBe('gemini-2.5-flash-lite');
    });

    it('should return default openai model', () => {
      expect(getDefaultModel('openai')).toBe('gpt-4.1-mini');
    });

    it('should return default anthropic model', () => {
      expect(getDefaultModel('anthropic')).toBe('claude-sonnet-4-20250514');
    });

    it('should return default ollama model', () => {
      expect(getDefaultModel('ollama')).toBe('llama3.2');
    });
  });

  describe('getAvailableModels', () => {
    it('should return array of gemini model keys', () => {
      const models = getAvailableModels('gemini');
      expect(Array.isArray(models)).toBe(true);
      expect(models).toContain('flash-lite');
      expect(models).toContain('flash');
      expect(models).toContain('flash-3');
    });

    it('should return array of openai model keys', () => {
      const models = getAvailableModels('openai');
      expect(Array.isArray(models)).toBe(true);
      expect(models).toContain('gpt-4.1-mini');
    });
  });

  describe('getModelList', () => {
    it('should return array of gemini model names', () => {
      const models = getModelList('gemini');
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(3);
    });

    it('should have default gemini model first', () => {
      const models = getModelList('gemini');
      expect(models[0]).toBe('gemini-2.5-flash-lite');
    });

    it('should contain all gemini models', () => {
      const models = getModelList('gemini');
      expect(models).toContain('gemini-2.5-flash-lite');
      expect(models).toContain('gemini-2.5-flash');
      expect(models).toContain('gemini-3-flash');
    });
  });
});
