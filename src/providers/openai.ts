import { AIProvider } from '../types/index.js';
import { getDefaultModel } from './models.js';

interface OpenAIChoice {
  message: {
    content: string | null;
  };
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
  error?: {
    message: string;
  };
}

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || getDefaultModel('openai');
  }

  async generateContent(systemPrompt: string, userMessage: string): Promise<string> {
    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
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
      throw new Error(`Unable to connect to OpenAI API. (${errorMessage})`);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${text}`);
    }

    const data = (await response.json()) as OpenAIResponse;

    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI API Error: Empty response content');
    }

    return content;
  }
}
