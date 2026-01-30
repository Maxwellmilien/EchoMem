import type { TranslationProvider, TranslationResult, TranslationError } from './types';

export class GoogleTranslationProvider implements TranslationProvider {
  name = 'Google Translate';
  requiresApiKey = true;

  private apiKey: string = '';
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  configure(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    if (!this.apiKey) {
      throw this.createError('AUTH_ERROR', 'API key not configured');
    }

    try {
      const url = `${this.baseUrl}?key=${encodeURIComponent(this.apiKey)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw this.createError('AUTH_ERROR', 'Invalid API key or quota exceeded');
        }
        if (response.status === 429) {
          throw this.createError('RATE_LIMIT', 'Rate limit exceeded');
        }
        if (response.status === 400) {
          throw this.createError('INVALID_REQUEST', 'Invalid request or unsupported language');
        }
        throw this.createError('UNKNOWN', `HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const translation = data.data.translations[0];

      return {
        text: translation.translatedText,
        detectedSourceLang: translation.detectedSourceLanguage?.toLowerCase()
      };
    } catch (error) {
      if ((error as TranslationError).code) {
        throw error;
      }
      throw this.createError('NETWORK_ERROR', 'Failed to connect to Google Translate API');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private createError(code: TranslationError['code'], message: string): TranslationError {
    return { code, message };
  }
}

export const googleTranslationProvider = new GoogleTranslationProvider();
