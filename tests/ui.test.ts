import { describe, it, expect, vi } from 'vitest';
import * as ui from '../src/utils/ui.js';

describe('UI Utils', () => {
  it('should export showBanner function', () => {
    expect(typeof ui.showBanner).toBe('function');
  });

  it('should export showSuggestion function', () => {
    expect(typeof ui.showSuggestion).toBe('function');
  });

  it('should export showSuccess function', () => {
    expect(typeof ui.showSuccess).toBe('function');
  });

  it('should export showError function', () => {
    expect(typeof ui.showError).toBe('function');
  });

  it('should export showWarning function', () => {
    expect(typeof ui.showWarning).toBe('function');
  });

  it('should export showInfo function', () => {
    expect(typeof ui.showInfo).toBe('function');
  });

  it('should export showTip function', () => {
    expect(typeof ui.showTip).toBe('function');
  });

  it('should export spinnerText object', () => {
    expect(ui.spinnerText).toBeDefined();
    expect(typeof ui.spinnerText.analyzing).toBe('string');
    expect(typeof ui.spinnerText.generating).toBe('string');
    expect(typeof ui.spinnerText.generatingWithContext).toBe('function');
  });

  describe('showBanner', () => {
    it('should not throw when called', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      expect(() => ui.showBanner()).not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  describe('showSuggestion', () => {
    it('should not throw when called with string', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      expect(() => ui.showSuggestion('test suggestion')).not.toThrow();
      consoleSpy.mockRestore();
    });
  });
});
