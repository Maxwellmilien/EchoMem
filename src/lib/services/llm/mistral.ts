import type { LLMProvider, GenerationRequest, GenerationResult, LLMError } from './types';
import { buildPrompt, parseResponse } from './prompts';

export class MistralProvider implements LLMProvider {
  name = 'Mistral';
  requiresApiKey = true;

  private apiKey: string = '';
  private model: string = 'mistral-small-latest';

  configure(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    if (model) {
      this.model = model;
    }
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    if (!this.apiKey) {
      throw this.createError('AUTH_ERROR', 'API key not configured');
    }

    const prompt = buildPrompt(request.word, request.sourceLang, request.targetLang, request.types);

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw this.createError('AUTH_ERROR', 'Invalid API key');
        }
        if (response.status === 429) {
          throw this.createError('RATE_LIMIT', 'Rate limit exceeded');
        }
        throw this.createError('UNKNOWN', `HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const cards = parseResponse(content);

      return {
        word: request.word,
        cards
      };
    } catch (error) {
      if ((error as LLMError).code) {
        throw error;
      }
      throw this.createError('NETWORK_ERROR', 'Failed to connect to Mistral API');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private createError(code: LLMError['code'], message: string): LLMError {
    return { code, message };
  }
}

export const mistralProvider = new MistralProvider();
