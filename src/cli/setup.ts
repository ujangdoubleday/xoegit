import { ConfigService } from '../config/index.js';
import { ProviderName } from '../types/index.js';
import {
  isValidApiKey,
  promptApiKey,
  promptSelect,
  promptText,
  showError,
  showInfo,
  showSuccess,
} from '../utils/index.js';
import {
  getApiKeyHelpUrl,
  getDefaultEndpoint,
  getDefaultModel,
  getModelList,
  getProviderLabel,
  listProviders,
  requiresApiKey,
  supportsCustomEndpoint,
} from '../providers/index.js';

export interface SetupResult {
  provider: ProviderName;
  apiKey?: string;
  baseUrl?: string;
}

export interface SetupOptions {
  /**
   * When the provider was already chosen explicitly (CLI flag / env var),
   * the wizard skips the provider-selection step and configures that one.
   */
  preselectedProvider?: ProviderName;
}

/**
 * Interactive first-run configuration: pick a provider, optionally set a
 * custom endpoint (falling back to the provider default), then enter the API
 * key. Everything chosen is persisted to the config file as we go.
 */
export async function runSetupWizard(
  configService: ConfigService,
  options: SetupOptions = {}
): Promise<SetupResult> {
  console.log('');
  showInfo('Setup configuration — no API key found yet.');
  console.log('');

  // 1. Provider selection
  let provider = options.preselectedProvider;
  if (!provider) {
    provider = await promptSelect<ProviderName>(
      'Select an AI provider:',
      listProviders().map((name) => ({
        label: getProviderLabel(name),
        value: name,
        hint: requiresApiKey(name) ? undefined : 'no API key required',
      }))
    );
  } else {
    showInfo(`Provider: ${getProviderLabel(provider)}`);
  }
  await configService.saveProvider(provider);

  // 2. Endpoint (only for providers that talk to a configurable endpoint)
  let baseUrl: string | undefined;
  if (supportsCustomEndpoint(provider)) {
    const defaultEndpoint = getDefaultEndpoint(provider);
    baseUrl = await promptText(
      `Custom endpoint for ${getProviderLabel(provider)} (leave empty for default)`,
      defaultEndpoint
    );

    if (provider === 'ollama') {
      await configService.saveOllamaBaseUrl(baseUrl);
    } else if (provider === 'openrouter') {
      await configService.saveOpenRouterBaseUrl(baseUrl);
    }
  }

  // 3. Model selection (every provider has a sensible default; Enter keeps it)
  const defaultModel = getDefaultModel(provider);
  showInfo(`Available models: ${getModelList(provider).join(', ')}`);
  const model = await promptText(
    `Model for ${getProviderLabel(provider)} (leave empty for default)`,
    defaultModel
  );
  await configService.saveModel(provider, model);

  // 4. API key (skipped for keyless providers such as Ollama)
  let apiKey: string | undefined;
  if (requiresApiKey(provider)) {
    const helpUrl = getApiKeyHelpUrl(provider);
    if (helpUrl) {
      showInfo(`Get an API key at ${helpUrl}`);
    }

    try {
      apiKey = await promptApiKey(provider);
    } catch (_err) {
      showError('Input Error', 'Failed to read input.');
      process.exit(1);
    }

    if (!apiKey || !isValidApiKey(apiKey)) {
      showError('Configuration Error', 'API Key is required to use xoegit.');
      process.exit(1);
    }

    await configService.saveApiKey(provider, apiKey);
  }

  console.log('');
  showSuccess('Configuration saved!');
  console.log('');

  return { provider, apiKey, baseUrl };
}
