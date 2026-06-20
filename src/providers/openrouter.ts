import { AIProvider } from '../types/index.js';
import { getDefaultModel, OPENROUTER_DEFAULT_BASE_URL, OPENROUTER_MODELS } from './models.js';

interface OpenRouterChoice {
  message: {
    content: string | null;
  };
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
  error?: {
    message: string;
  };
}

/**
 * Resolve a curated shortcut key (e.g. "gpt-4o-mini") to its fully-qualified
 * OpenRouter slug. Unknown values are passed through unchanged so any raw slug
 * (e.g. "openai/gpt-4o") works out of the box.
 */
function resolveModel(model: string): string {
  return (OPENROUTER_MODELS as Record<string, string>)[model] ?? model;
}

/**
 * OpenRouter provider — talks to the OpenAI-compatible chat completions
 * endpoint at https://openrouter.ai/api/v1/chat/completions.
 *
 * The base URL is configurable (constructor / --openrouter-url /
 * XOEGIT_OPENROUTER_BASE_URL) to keep the integration modular.
 */
export class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = resolveModel(model || getDefaultModel('openrouter'));
    this.baseUrl = (baseUrl || OPENROUTER_DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  async generateContent(systemPrompt: string, userMessage: string): Promise<string> {
    let response: Response;
    try {
      response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          // Optional attribution headers recommended by OpenRouter.
          'HTTP-Referer': 'https://github.com/ujangdoubleday/xoegit',
          'X-Title': 'xoegit',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
        }),
      });
    } catch (fetchError: unknown) {
      const errorMessage = (fetchError as Error)?.message || String(fetchError);
      throw new Error(`Unable to connect to OpenRouter API. (${errorMessage})`, {
        cause: fetchError,
      });
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API Error (${response.status}): ${text}`);
    }

    const data = (await response.json()) as OpenRouterResponse;

    if (data.error) {
      throw new Error(`OpenRouter API Error: ${data.error.message}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter API Error: Empty response content');
    }

    return content;
  }
}
