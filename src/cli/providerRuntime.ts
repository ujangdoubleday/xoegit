import { ConfigService } from '../config/index.js';
import { ProviderName } from '../types/index.js';

/**
 * CLI options that influence which model/endpoint a provider talks to.
 */
export interface ProviderRuntimeOptions {
  model?: string;
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
  // Explicit --model flag wins, else the saved per-provider model (env > config).
  const model = options.model || (await configService.getModel(provider));

  switch (provider) {
    case 'ollama':
      return {
        model,
        baseUrl: await configService.getOllamaBaseUrl(),
      };
    case 'openrouter':
      return {
        model,
        // undefined lets OpenRouterProvider fall back to its default endpoint.
        baseUrl: await configService.getOpenRouterBaseUrl(),
      };
    default:
      return { model };
  }
}
