import fs from 'fs/promises';
import path from 'path';
import { XoegitConfig } from '../types/index.js';
import { getConfigPath } from './constants.js';
import { isValidApiKey } from '../utils/index.js';
import { encrypt, decrypt, isEncrypted } from './encryption.js';

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

      if (config.XOEGIT_GEMINI_API_KEY) {
        let apiKey = config.XOEGIT_GEMINI_API_KEY;

        // check if encrypted and decrypt
        if (isEncrypted(apiKey)) {
          try {
            apiKey = decrypt(apiKey);
          } catch (_decryptError) {
            // decryption failed, treat as invalid
            return undefined;
          }
        } else {
          // plain text key found, migrate to encrypted format
          await this.saveApiKey(apiKey);
        }

        if (isValidApiKey(apiKey)) {
          return apiKey;
        }
      }
    } catch (_error) {
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
      } catch (_e) {
        // ignore
      }

      // encrypt the API key before saving
      config.XOEGIT_GEMINI_API_KEY = encrypt(apiKey);
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), { mode: 0o600 });
    } catch (error: unknown) {
      throw new Error(`Failed to save configuration: ${(error as Error).message}`);
    }
  }

  async deleteApiKey(): Promise<void> {
    try {
      const configStr = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configStr) as XoegitConfig;
      delete config.XOEGIT_GEMINI_API_KEY;

      if (Object.keys(config).length === 0) {
        // Delete the file if no other config remains
        await fs.unlink(this.configPath);
      } else {
        await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), { mode: 0o600 });
      }
    } catch (error: unknown) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Failed to delete API key: ${(error as Error).message}`);
      }
    }
  }
}
