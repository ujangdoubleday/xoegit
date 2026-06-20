import { ProviderName } from '../types/index.js';

/* ------------------------------------------------------------------ */
/*  Gemini                                                            */
/* ------------------------------------------------------------------ */
export const GEMINI_MODELS = {
  'flash-lite': 'gemini-2.5-flash-lite',
  flash: 'gemini-2.5-flash',
  'flash-3': 'gemini-3-flash',
} as const;

export type GeminiModelKey = keyof typeof GEMINI_MODELS;
export type GeminiModelName = (typeof GEMINI_MODELS)[GeminiModelKey];

/* ------------------------------------------------------------------ */
/*  OpenAI                                                            */
/* ------------------------------------------------------------------ */
export const OPENAI_MODELS = {
  'gpt-4.1-mini': 'gpt-4.1-mini',
  'gpt-4.1': 'gpt-4.1',
  'gpt-4.1-nano': 'gpt-4.1-nano',
} as const;

export type OpenAIModelKey = keyof typeof OPENAI_MODELS;
export type OpenAIModelName = (typeof OPENAI_MODELS)[OpenAIModelKey];

/* ------------------------------------------------------------------ */
/*  Anthropic                                                         */
/* ------------------------------------------------------------------ */
export const ANTHROPIC_MODELS = {
  'claude-sonnet-4': 'claude-sonnet-4-20250514',
  'claude-opus-4': 'claude-opus-4-20260701',
  'claude-haiku-4': 'claude-haiku-4-20250514',
} as const;

export type AnthropicModelKey = keyof typeof ANTHROPIC_MODELS;
export type AnthropicModelName = (typeof ANTHROPIC_MODELS)[AnthropicModelKey];

/* ------------------------------------------------------------------ */
/*  Ollama                                                            */
/* ------------------------------------------------------------------ */
export const OLLAMA_MODELS = {
  'llama3.2': 'llama3.2',
  'llama3.1': 'llama3.1',
  'qwen2.5': 'qwen2.5',
} as const;

export type OllamaModelKey = keyof typeof OLLAMA_MODELS;
export type OllamaModelName = (typeof OLLAMA_MODELS)[OllamaModelKey];

/* ------------------------------------------------------------------ */
/*  OpenRouter                                                        */
/* ------------------------------------------------------------------ */
/**
 * Default REST endpoint for OpenRouter (OpenAI-compatible).
 * Override via the setup wizard or XOEGIT_OPENROUTER_BASE_URL.
 */
export const OPENROUTER_DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Curated shortcut keys -> fully-qualified OpenRouter model slugs.
 * Any raw slug (e.g. "openai/gpt-4o") is also accepted via --model.
 */
export const OPENROUTER_MODELS = {
  // `openrouter/auto` lets OpenRouter pick a suitable model automatically.
  auto: 'openrouter/auto',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'claude-3.5-haiku': 'anthropic/claude-3.5-haiku',
  'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct',
  'deepseek-chat': 'deepseek/deepseek-chat',
} as const;

export type OpenRouterModelKey = keyof typeof OPENROUTER_MODELS;
export type OpenRouterModelName = (typeof OPENROUTER_MODELS)[OpenRouterModelKey];

/* ------------------------------------------------------------------ */
/*  Defaults                                                          */
/* ------------------------------------------------------------------ */
const DEFAULT_MODELS: Record<ProviderName, string> = {
  gemini: GEMINI_MODELS['flash-lite'],
  openai: OPENAI_MODELS['gpt-4.1-mini'],
  anthropic: ANTHROPIC_MODELS['claude-sonnet-4'],
  ollama: OLLAMA_MODELS['llama3.2'],
  openrouter: OPENROUTER_MODELS['auto'],
};

export function getDefaultModel(provider: ProviderName): string {
  return DEFAULT_MODELS[provider];
}

/* ------------------------------------------------------------------ */
/*  Model lists                                                       */
/* ------------------------------------------------------------------ */
const MODEL_LISTS: Record<ProviderName, string[]> = {
  gemini: Object.values(GEMINI_MODELS),
  openai: Object.values(OPENAI_MODELS),
  anthropic: Object.values(ANTHROPIC_MODELS),
  ollama: Object.values(OLLAMA_MODELS),
  openrouter: Object.values(OPENROUTER_MODELS),
};

/**
 * Get ordered list of model names for fallback. The preferred model (an
 * explicit override, else the provider default) is tried first, then the rest.
 * Currently only Gemini uses the fallback; others read just the first entry.
 */
export function getModelList(provider: ProviderName, preferred?: string): string[] {
  const allModels = MODEL_LISTS[provider];
  const first = preferred || getDefaultModel(provider);

  // Put the preferred model first, then the rest (deduped)
  return [first, ...allModels.filter((m) => m !== first)];
}

/**
 * Get list of available model keys for CLI help
 */
export function getAvailableModels(provider: ProviderName): string[] {
  switch (provider) {
    case 'gemini':
      return Object.keys(GEMINI_MODELS);
    case 'openai':
      return Object.keys(OPENAI_MODELS);
    case 'anthropic':
      return Object.keys(ANTHROPIC_MODELS);
    case 'ollama':
      return Object.keys(OLLAMA_MODELS);
    case 'openrouter':
      return Object.keys(OPENROUTER_MODELS);
    default:
      return [];
  }
}

/**
 * Validate if a model name is valid for a provider
 */
export function isValidModel(provider: ProviderName, model: string): boolean {
  return MODEL_LISTS[provider].includes(model);
}
