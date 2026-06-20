import fs from 'fs/promises';
import path from 'path';
import { XoegitConfig, ProviderName } from '../types/index.js';
import { getConfigPath } from './constants.js';
import { isValidApiKey } from '../utils/index.js';
import { encrypt, decrypt, isEncrypted } from './encryption.js';
import { getApiKeyEnvVar, requiresApiKey } from '../providers/registry.js';

export class ConfigService {
  private configPath: string;

  constructor() {
    this.configPath = getConfigPath();
  }

  /**
   * Load config from disk
   */
  private async loadConfig(): Promise<XoegitConfig> {
    try {
      const configStr = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(configStr) as XoegitConfig;
    } catch (_error) {
      return {};
    }
  }

  /**
   * Save config to disk
   */
  private async saveConfig(config: XoegitConfig): Promise<void> {
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), { mode: 0o600 });
  }

  /**
   * Get configured provider (env > config > default)
   */
  async getProvider(): Promise<ProviderName> {
    const validProviders: ProviderName[] = [
      'gemini',
      'openai',
      'anthropic',
      'ollama',
      'openrouter',
    ];

    const envProvider = process.env.XOEGIT_PROVIDER as ProviderName | undefined;
    if (envProvider && validProviders.includes(envProvider)) {
      return envProvider;
    }

    const config = await this.loadConfig();
    if (config.provider && validProviders.includes(config.provider)) {
      return config.provider;
    }

    return 'gemini';
  }

  /**
   * Save preferred provider
   */
  async saveProvider(provider: ProviderName): Promise<void> {
    const config = await this.loadConfig();
    config.provider = provider;
    await this.saveConfig(config);
  }

  /**
   * Get API key for a specific provider (env > config > undefined)
   */
  async getApiKey(provider: ProviderName): Promise<string | undefined> {
    if (!requiresApiKey(provider)) {
      return undefined;
    }

    const envVar = getApiKeyEnvVar(provider);

    // 1. Check environment variable
    if (envVar && process.env[envVar]) {
      return process.env[envVar];
    }

    // 2. Check config file
    const config = await this.loadConfig();
    const configKey = envVar as keyof XoegitConfig;
    const rawKey = config[configKey] as string | undefined;

    if (rawKey) {
      let apiKey = rawKey;

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
        await this.saveApiKey(provider, apiKey);
      }

      if (isValidApiKey(apiKey)) {
        return apiKey;
      }
    }

    return undefined;
  }

  /**
   * Save API key for a specific provider
   */
  async saveApiKey(provider: ProviderName, apiKey: string): Promise<void> {
    if (!requiresApiKey(provider)) {
      return;
    }

    const envVar = getApiKeyEnvVar(provider);
    if (!envVar) {
      return;
    }

    const config = await this.loadConfig();
    (config as Record<string, string>)[envVar] = encrypt(apiKey);
    await this.saveConfig(config);
  }

  /**
   * Delete API key for a specific provider
   */
  async deleteApiKey(provider: ProviderName): Promise<void> {
    const config = await this.loadConfig();
    const envVar = getApiKeyEnvVar(provider);

    if (envVar) {
      delete (config as Record<string, unknown>)[envVar];
    }

    if (Object.keys(config).length === 0) {
      try {
        await fs.unlink(this.configPath);
      } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw new Error(`Failed to delete API key: ${(error as Error).message}`, {
            cause: error,
          });
        }
      }
    } else {
      await this.saveConfig(config);
    }
  }

  /**
   * Get Ollama base URL (env > config > default)
   */
  async getOllamaBaseUrl(): Promise<string> {
    const envUrl = process.env.XOEGIT_OLLAMA_BASE_URL;
    if (envUrl) {
      return envUrl;
    }

    const config = await this.loadConfig();
    if (config.XOEGIT_OLLAMA_BASE_URL) {
      return config.XOEGIT_OLLAMA_BASE_URL;
    }

    return 'http://localhost:11434';
  }

  /**
   * Save Ollama base URL
   */
  async saveOllamaBaseUrl(baseUrl: string): Promise<void> {
    const config = await this.loadConfig();
    config.XOEGIT_OLLAMA_BASE_URL = baseUrl;
    await this.saveConfig(config);
  }

  /**
   * Get Ollama model (env > config > default)
   */
  async getOllamaModel(): Promise<string | undefined> {
    const envModel = process.env.XOEGIT_OLLAMA_MODEL;
    if (envModel) {
      return envModel;
    }

    const config = await this.loadConfig();
    return config.XOEGIT_OLLAMA_MODEL;
  }

  /**
   * Save Ollama model
   */
  async saveOllamaModel(model: string): Promise<void> {
    const config = await this.loadConfig();
    config.XOEGIT_OLLAMA_MODEL = model;
    await this.saveConfig(config);
  }

  /**
   * Get OpenRouter base URL (env > config > undefined; provider falls back to default)
   */
  async getOpenRouterBaseUrl(): Promise<string | undefined> {
    const envUrl = process.env.XOEGIT_OPENROUTER_BASE_URL;
    if (envUrl) {
      return envUrl;
    }

    const config = await this.loadConfig();
    return config.XOEGIT_OPENROUTER_BASE_URL;
  }

  /**
   * Save OpenRouter base URL
   */
  async saveOpenRouterBaseUrl(baseUrl: string): Promise<void> {
    const config = await this.loadConfig();
    config.XOEGIT_OPENROUTER_BASE_URL = baseUrl;
    await this.saveConfig(config);
  }

  /**
   * Get OpenRouter model (env > config > undefined)
   */
  async getOpenRouterModel(): Promise<string | undefined> {
    const envModel = process.env.XOEGIT_OPENROUTER_MODEL;
    if (envModel) {
      return envModel;
    }

    const config = await this.loadConfig();
    return config.XOEGIT_OPENROUTER_MODEL;
  }

  /**
   * Save OpenRouter model
   */
  async saveOpenRouterModel(model: string): Promise<void> {
    const config = await this.loadConfig();
    config.XOEGIT_OPENROUTER_MODEL = model;
    await this.saveConfig(config);
  }
}
