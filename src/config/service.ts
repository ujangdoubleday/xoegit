import fs from 'fs/promises';
import path from 'path';
import { XoegitConfig } from '../types/index.js';
import { getConfigPath } from './constants.js';
import { isValidApiKey } from '../utils/index.js';

export class ConfigService {
  private configPath: string;

  constructor() {
    this.configPath = getConfigPath();
  }

  async getApiKey(): Promise<string | undefined> {
    // 1. Check environment variable
    if (process.env.XOEGIT_GEMINI_API_KEY) {
      return process.env.XOEGIT_GEMINI_API_KEY;
    }

    // 2. Check config file
    try {
      const configStr = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configStr) as XoegitConfig;
      if (config.XOEGIT_GEMINI_API_KEY && isValidApiKey(config.XOEGIT_GEMINI_API_KEY)) {
        return config.XOEGIT_GEMINI_API_KEY;
      }
    } catch (error) {
      // Config file doesn't exist or is invalid, ignore
    }

    return undefined;
  }

  async saveApiKey(apiKey: string): Promise<void> {
    try {
      const dir = path.dirname(this.configPath);
      await fs.mkdir(dir, { recursive: true });

      let config: XoegitConfig = {};
      try {
        const existing = await fs.readFile(this.configPath, 'utf-8');
        config = JSON.parse(existing);
      } catch (e) {
        // ignore
      }

      config.XOEGIT_GEMINI_API_KEY = apiKey;
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), { mode: 0o600 });
    } catch (error) {
      throw new Error(`Failed to save configuration: ${(error as any).message}`);
    }
  }
}
