/**
 * Supported AI provider names
 */
export type ProviderName = 'gemini' | 'openai' | 'anthropic' | 'ollama';

/**
 * Configuration passed when creating a provider instance
 */
export interface ProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

/**
 * Common interface for all AI providers
 */
export interface AIProvider {
  generateContent(systemPrompt: string, userMessage: string): Promise<string>;
}
