import { describe, it, expect } from 'vitest';
import { getConfigPath } from '../src/config/constants.js';

describe('Config Constants', () => {
  it('should return a valid config path', () => {
    const configPath = getConfigPath();
    expect(configPath).toBeDefined();
    expect(typeof configPath).toBe('string');
    expect(configPath).toContain('xoegit');
    expect(configPath).toContain('config.json');
  });

  it('should return platform-specific path', () => {
    const configPath = getConfigPath();
    
    if (process.platform === 'win32') {
      expect(configPath).toContain('AppData');
    } else if (process.platform === 'darwin') {
      expect(configPath).toContain('Library');
    } else {
      expect(configPath).toContain('.config');
    }
  });
});
