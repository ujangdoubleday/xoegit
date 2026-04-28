import { describe, it, expect } from 'vitest';
import { parsePeriod, getPeriodLabel } from '../src/git/report.js';
import { generateReportSystemPrompt, generateReportUserPrompt } from '../src/prompts/report.js';

describe('Git Report Module', () => {
  describe('parsePeriod', () => {
    it('should parse weeks format', () => {
      const result = parsePeriod('4W');
      expect(result.value).toBe(4);
      expect(result.unit).toBe('weeks');
      expect(result.isNow).toBe(false);
    });

    it('should parse days format', () => {
      const result = parsePeriod('3D');
      expect(result.value).toBe(3);
      expect(result.unit).toBe('days');
      expect(result.isNow).toBe(false);
    });

    it('should parse months format', () => {
      const result = parsePeriod('2M');
      expect(result.value).toBe(2);
      expect(result.unit).toBe('months');
      expect(result.isNow).toBe(false);
    });

    it('should parse lowercase format', () => {
      const result = parsePeriod('1w');
      expect(result.value).toBe(1);
      expect(result.unit).toBe('weeks');
    });

    it('should parse NOW', () => {
      const result = parsePeriod('NOW');
      expect(result.isNow).toBe(true);
      expect(result.raw).toBe('NOW');
    });

    it('should parse now (lowercase)', () => {
      const result = parsePeriod('now');
      expect(result.isNow).toBe(true);
    });

    it('should throw for invalid format', () => {
      expect(() => parsePeriod('invalid')).toThrow('Invalid period format');
    });

    it('should throw for empty string', () => {
      expect(() => parsePeriod('')).toThrow('Invalid period format');
    });
  });

  describe('getPeriodLabel', () => {
    it('should return label for weeks', () => {
      const period = parsePeriod('4W');
      expect(getPeriodLabel(period)).toBe('4 weeks');
    });

    it('should return singular label for 1 week', () => {
      const period = parsePeriod('1W');
      expect(getPeriodLabel(period)).toBe('1 week');
    });

    it('should return label for days', () => {
      const period = parsePeriod('3D');
      expect(getPeriodLabel(period)).toBe('3 days');
    });

    it('should return label for months', () => {
      const period = parsePeriod('2M');
      expect(getPeriodLabel(period)).toBe('2 months');
    });

    it('should return "today" for NOW', () => {
      const period = parsePeriod('NOW');
      expect(getPeriodLabel(period)).toBe('today');
    });
  });
});

describe('Report Prompts', () => {
  describe('generateReportSystemPrompt', () => {
    it('should generate prompt in English by default', () => {
      const prompt = generateReportSystemPrompt();
      expect(prompt).toContain('English');
      expect(prompt).toContain('WEEKLY GROUPING');
    });

    it('should generate prompt in Indonesian when specified', () => {
      const prompt = generateReportSystemPrompt('id');
      expect(prompt).toContain('Bahasa Indonesia');
    });

    it('should generate prompt in Japanese when specified', () => {
      const prompt = generateReportSystemPrompt('ja');
      expect(prompt).toContain('Japanese');
    });
  });

  describe('generateReportUserPrompt', () => {
    it('should include period label and git log', () => {
      const prompt = generateReportUserPrompt({
        periodLabel: '4 weeks',
        rawGitLog: '2024-01-01 | feat: add login',
        language: 'en',
      });
      expect(prompt).toContain('4 weeks');
      expect(prompt).toContain('2024-01-01 | feat: add login');
    });
  });
});
