import { AIProvider } from '../types/index.js';
import { getDefaultModel } from './models.js';

interface OllamaMessage {
  role: string;
  content: string;
}

interface OllamaResponse {
  message: OllamaMessage;
  done: boolean;
  error?: string;
}

export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string, model?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model || getDefaultModel('ollama');
  }

  async generateContent(systemPrompt: string, userMessage: string): Promise<string> {
    const url = `${this.baseUrl}/api/chat`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          stream: false,
        }),
      });
    } catch (fetchError: unknown) {
      const errorMessage = (fetchError as Error)?.message || String(fetchError);
      throw new Error(
        `Unable to connect to Ollama at ${url}. ` +
          `Make sure Ollama is running and reachable. (${errorMessage})`
      );
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama API Error (${response.status}): ${text}`);
    }

    const data = (await response.json()) as OllamaResponse;

    if (data.error) {
      throw new Error(`Ollama API Error: ${data.error}`);
    }

    const content = data.message?.content;
    if (!content) {
      throw new Error('Ollama API Error: Empty response content');
    }

    return content;
  }
}
