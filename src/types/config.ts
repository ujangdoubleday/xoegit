import { ProviderName } from './provider.js';

export interface XoegitConfig {
  provider?: ProviderName;
  XOEGIT_GEMINI_API_KEY?: string;
  XOEGIT_OPENAI_API_KEY?: string;
  XOEGIT_ANTHROPIC_API_KEY?: string;
  XOEGIT_OLLAMA_BASE_URL?: string;
  XOEGIT_OLLAMA_MODEL?: string;
}
