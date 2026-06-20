import { ConfigService } from '../config/index.js';
import { ProviderName } from '../types/index.js';

/**
 * CLI options that influence which model/endpoint a provider talks to.
 */
export interface ProviderRuntimeOptions {
  model?: string;
  ollamaUrl?: string;
  openrouterUrl?: string;
}

/**
 * Resolved per-call settings handed to {@link createProvider}.
 */
export interface ProviderRuntime {
  model?: string;
  baseUrl?: string;
}

/**
 * Resolve the model + base URL for a provider from CLI flags and saved config.
 *
 * Keeping this in one place lets analyze/report share identical resolution
 * logic and makes adding a new provider a single-switch change.
 */
export async function resolveProviderRuntime(
  configService: ConfigService,
  provider: ProviderName,
  options: ProviderRuntimeOptions
): Promise<ProviderRuntime> {
  const model = options.model;

  switch (provider) {
    case 'ollama':
      return {
        model: model || (await configService.getOllamaModel()),
        baseUrl: options.ollamaUrl || (await configService.getOllamaBaseUrl()),
      };
    case 'openrouter':
      return {
        model: model || (await configService.getOpenRouterModel()),
        // undefined lets OpenRouterProvider fall back to its default endpoint.
        baseUrl: options.openrouterUrl || (await configService.getOpenRouterBaseUrl()),
      };
    default:
      return { model };
  }
}
