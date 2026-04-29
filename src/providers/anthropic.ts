import { AIProvider } from '../types/index.js';
import { getDefaultModel } from './models.js';

interface AnthropicContentBlock {
  type: string;
  text: string;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
  error?: {
    message: string;
  };
}

export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || getDefaultModel('anthropic');
  }

  async generateContent(systemPrompt: string, userMessage: string): Promise<string> {
    let response: Response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });
    } catch (fetchError: unknown) {
      const errorMessage = (fetchError as Error)?.message || String(fetchError);
      throw new Error(`Unable to connect to Anthropic API. (${errorMessage})`);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic API Error (${response.status}): ${text}`);
    }

    const data = (await response.json()) as AnthropicResponse;

    if (data.error) {
      throw new Error(`Anthropic API Error: ${data.error.message}`);
    }

    const text = data.content?.[0]?.text;
    if (!text) {
      throw new Error('Anthropic API Error: Empty response content');
    }

    return text;
  }
}
