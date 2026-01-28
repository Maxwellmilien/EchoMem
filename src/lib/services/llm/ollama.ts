import type { LLMProvider, GenerationRequest, GenerationResult, LLMError } from './types';
import { buildPrompt, parseResponse } from './prompts';

export class OllamaProvider implements LLMProvider {
  name = 'Ollama';
  requiresApiKey = false;

  private baseUrl: string = 'http://localhost:11434';
  private model: string = 'llama2';

  configure(model?: string, baseUrl?: string) {
    if (model) {
      this.model = model;
    }
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const prompt = buildPrompt(request.word, request.sourceLang, request.targetLang, request.types);

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        throw this.createError('UNKNOWN', `HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.response || '';
      const cards = parseResponse(content);

      return {
        word: request.word,
        cards
      };
    } catch (error) {
      if ((error as LLMError).code) {
        throw error;
      }
      throw this.createError('NETWORK_ERROR', 'Failed to connect to Ollama. Make sure it is running locally.');
    }
  }

  isConfigured(): boolean {
    return true;
  }

  private createError(code: LLMError['code'], message: string): LLMError {
    return { code, message };
  }
}

export const ollamaProvider = new OllamaProvider();
