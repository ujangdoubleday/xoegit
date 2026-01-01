/**
 * Available Gemini models for free tier
 */
export const GEMINI_MODELS = {
  'flash-lite': 'gemini-2.5-flash-lite',
  flash: 'gemini-2.5-flash',
  'flash-3': 'gemini-3-flash',
} as const;

export type GeminiModelKey = keyof typeof GEMINI_MODELS;
export type GeminiModelName = (typeof GEMINI_MODELS)[GeminiModelKey];

/**
 * Default model to use
 */
export const DEFAULT_MODEL: GeminiModelKey = 'flash-lite';

/**
 * Get model name from key, returns default if invalid
 */
export function getModelName(key?: string): GeminiModelName {
  if (key && key in GEMINI_MODELS) {
    return GEMINI_MODELS[key as GeminiModelKey];
  }
  return GEMINI_MODELS[DEFAULT_MODEL];
}

/**
 * Get list of available model keys for CLI help
 */
export function getAvailableModels(): string[] {
  return Object.keys(GEMINI_MODELS);
}

/**
 * Get ordered list of model names for fallback (default first)
 */
export function getModelList(): GeminiModelName[] {
  const defaultModelName = GEMINI_MODELS[DEFAULT_MODEL];
  const allModels = Object.values(GEMINI_MODELS);

  // Put default model first, then the rest
  return [defaultModelName, ...allModels.filter((m) => m !== defaultModelName)];
}
