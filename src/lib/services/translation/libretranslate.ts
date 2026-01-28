import type { TranslationProvider, TranslationResult, TranslationError } from './types';

export class LibreTranslateProvider implements TranslationProvider {
  name = 'LibreTranslate';
  requiresApiKey = false;

  private apiKey: string = '';
  private baseUrl = 'https://libretranslate.com';

  configure(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey ?? '';
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    try {
      const body: Record<string, string> = {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      };

      if (this.apiKey) {
        body.api_key = this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw this.createError('AUTH_ERROR', 'Invalid API key or access denied');
        }
        if (response.status === 429) {
          throw this.createError('RATE_LIMIT', 'Rate limit exceeded');
        }
        throw this.createError('UNKNOWN', `HTTP error: ${response.status}`);
      }

      const data = await response.json();

      return {
        text: data.translatedText,
        detectedSourceLang: data.detectedLanguage?.language
      };
    } catch (error) {
      if ((error as TranslationError).code) {
        throw error;
      }
      throw this.createError('NETWORK_ERROR', 'Failed to connect to LibreTranslate');
    }
  }

  isConfigured(): boolean {
    return true;
  }

  private createError(code: TranslationError['code'], message: string): TranslationError {
    return { code, message };
  }
}

export const libreTranslateProvider = new LibreTranslateProvider();
