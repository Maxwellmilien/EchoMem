import type { TranslationProvider, TranslationResult, TranslationError } from './types';

export class DeepLTranslationProvider implements TranslationProvider {
  name = 'DeepL';
  requiresApiKey = true;

  private apiKey: string = '';
  private baseUrl = 'https://api-free.deepl.com/v2';

  configure(apiKey: string, usePro: boolean = false) {
    this.apiKey = apiKey;
    this.baseUrl = usePro ? 'https://api.deepl.com/v2' : 'https://api-free.deepl.com/v2';
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
      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: [text],
          source_lang: sourceLang.toUpperCase(),
          target_lang: targetLang.toUpperCase()
        })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw this.createError('AUTH_ERROR', 'Invalid API key');
        }
        if (response.status === 429) {
          throw this.createError('RATE_LIMIT', 'Rate limit exceeded');
        }
        throw this.createError('UNKNOWN', `HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const translation = data.translations[0];

      return {
        text: translation.text,
        detectedSourceLang: translation.detected_source_language?.toLowerCase()
      };
    } catch (error) {
      if ((error as TranslationError).code) {
        throw error;
      }
      throw this.createError('NETWORK_ERROR', 'Failed to connect to DeepL API');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private createError(code: TranslationError['code'], message: string): TranslationError {
    return { code, message };
  }
}

export const deeplTranslationProvider = new DeepLTranslationProvider();
