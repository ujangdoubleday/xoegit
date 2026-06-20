import { AIProvider, ProviderName, ProviderConfig } from '../types/index.js';
import { GeminiProvider } from './gemini.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { OllamaProvider } from './ollama.js';
import { OpenRouterProvider } from './openrouter.js';
import { OPENROUTER_DEFAULT_BASE_URL } from './models.js';

/**
 * Default base URL for the local Ollama server.
 */
export const OLLAMA_DEFAULT_BASE_URL = 'http://localhost:11434';

/**
 * Create an AI provider instance based on name and config
 */
export function createProvider(name: ProviderName, config: ProviderConfig): AIProvider {
  switch (name) {
    case 'gemini': {
      if (!config.apiKey) {
        throw new Error('Gemini provider requires an API key');
      }
      return new GeminiProvider(config.apiKey, config.model);
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
      const baseUrl = config.baseUrl || OLLAMA_DEFAULT_BASE_URL;
      return new OllamaProvider(baseUrl, config.model);
    }
    case 'openrouter': {
      if (!config.apiKey) {
        throw new Error('OpenRouter provider requires an API key');
      }
      return new OpenRouterProvider(config.apiKey, config.model, config.baseUrl);
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
    openrouter: 'OpenRouter',
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
    openrouter: 'XOEGIT_OPENROUTER_API_KEY',
  };
  return envVars[name];
}

/**
 * Ordered list of all selectable providers (used by the setup wizard).
 */
export function listProviders(): ProviderName[] {
  return ['gemini', 'openai', 'anthropic', 'openrouter', 'ollama'];
}

/**
 * Whether a provider talks to a configurable endpoint (so the setup wizard
 * should offer a custom-endpoint step).
 */
export function supportsCustomEndpoint(name: ProviderName): boolean {
  return name === 'ollama' || name === 'openrouter';
}

/**
 * Default endpoint/base URL for providers that expose one, else undefined.
 */
export function getDefaultEndpoint(name: ProviderName): string | undefined {
  switch (name) {
    case 'ollama':
      return OLLAMA_DEFAULT_BASE_URL;
    case 'openrouter':
      return OPENROUTER_DEFAULT_BASE_URL;
    default:
      return undefined;
  }
}

/**
 * Where to obtain an API key for a provider (shown during setup).
 */
export function getApiKeyHelpUrl(name: ProviderName): string | undefined {
  const urls: Record<ProviderName, string | undefined> = {
    gemini: 'https://aistudio.google.com/',
    openai: 'https://platform.openai.com/api-keys',
    anthropic: 'https://console.anthropic.com/settings/keys',
    ollama: undefined,
    openrouter: 'https://openrouter.ai/keys',
  };
  return urls[name];
}
