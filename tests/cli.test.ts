import { describe, it, expect } from 'vitest';
import { program } from '../src/cli/program.js';

describe('CLI Program', () => {
  it('should have correct name', () => {
    expect(program.name()).toBe('xoegit');
  });

  it('should have correct description', () => {
    expect(program.description()).toBe('AI-powered git commit generator');
  });

  it('should have version', () => {
    expect(program.version()).toBeDefined();
  });

  it('should have --api-key option', () => {
    const options = program.options;
    const apiKeyOption = options.find((opt) => opt.long === '--api-key');
    expect(apiKeyOption).toBeDefined();
    expect(apiKeyOption?.short).toBe('-k');
  });

  it('should have --context option', () => {
    const options = program.options;
    const contextOption = options.find((opt) => opt.long === '--context');
    expect(contextOption).toBeDefined();
    expect(contextOption?.short).toBe('-c');
  });

  it('should have --set-key option', () => {
    const options = program.options;
    const setKeyOption = options.find((opt) => opt.long === '--set-key');
    expect(setKeyOption).toBeDefined();
    expect(setKeyOption?.short).toBe('-s');
  });

  it('should have --delete-key option', () => {
    const options = program.options;
    const deleteKeyOption = options.find((opt) => opt.long === '--delete-key');
    expect(deleteKeyOption).toBeDefined();
    expect(deleteKeyOption?.short).toBe('-d');
  });
});
