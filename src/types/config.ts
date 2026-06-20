import { ProviderName } from './provider.js';

export interface XoegitConfig {
  provider?: ProviderName;
  XOEGIT_GEMINI_API_KEY?: string;
  XOEGIT_GEMINI_MODEL?: string;
  XOEGIT_OPENAI_API_KEY?: string;
  XOEGIT_OPENAI_MODEL?: string;
  XOEGIT_ANTHROPIC_API_KEY?: string;
  XOEGIT_ANTHROPIC_MODEL?: string;
  XOEGIT_OLLAMA_BASE_URL?: string;
  XOEGIT_OLLAMA_MODEL?: string;
  XOEGIT_OPENROUTER_API_KEY?: string;
  XOEGIT_OPENROUTER_BASE_URL?: string;
  XOEGIT_OPENROUTER_MODEL?: string;
}
