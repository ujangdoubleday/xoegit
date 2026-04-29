import { AIProvider, ProviderName, ProviderConfig } from '../types/index.js';
import { GeminiProvider } from './gemini.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { OllamaProvider } from './ollama.js';

/**
 * Create an AI provider instance based on name and config
 */
export function createProvider(name: ProviderName, config: ProviderConfig): AIProvider {
  switch (name) {
    case 'gemini': {
      if (!config.apiKey) {
        throw new Error('Gemini provider requires an API key');
      }
      return new GeminiProvider(config.apiKey);
    }
    case 'openai': {
      if (!config.apiKey) {
        throw new Error('OpenAI provider requires an API key');
      }
      return new OpenAIProvider(config.apiKey, config.model);
    }
    case 'anthropic': {
      if (!config.apiKey) {
        throw new Error('Anthropic provider requires an API key');
      }
      return new AnthropicProvider(config.apiKey, config.model);
    }
    case 'ollama': {
      const baseUrl = config.baseUrl || 'http://localhost:11434';
      return new OllamaProvider(baseUrl, config.model);
    }
    default: {
      throw new Error(`Unknown provider: ${name}`);
    }
  }
}

/**
 * Get a human-readable provider label
 */
export function getProviderLabel(name: ProviderName): string {
  const labels: Record<ProviderName, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI',
    anthropic: 'Anthropic Claude',
    ollama: 'Ollama (Local)',
  };
  return labels[name];
}

/**
 * Check if a provider requires an API key
 */
export function requiresApiKey(name: ProviderName): boolean {
  return name !== 'ollama';
}

/**
 * Get the environment variable name for a provider's API key
 */
export function getApiKeyEnvVar(name: ProviderName): string | undefined {
  const envVars: Record<ProviderName, string | undefined> = {
    gemini: 'XOEGIT_GEMINI_API_KEY',
    openai: 'XOEGIT_OPENAI_API_KEY',
    anthropic: 'XOEGIT_ANTHROPIC_API_KEY',
    ollama: undefined,
  };
  return envVars[name];
}
