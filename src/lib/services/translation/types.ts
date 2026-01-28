export interface TranslationResult {
  text: string;
  detectedSourceLang?: string;
  alternatives?: string[];
}

export interface TranslationProvider {
  name: string;
  requiresApiKey: boolean;

  translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult>;

  isConfigured(): boolean;
}

export interface TranslationError {
  code: 'NETWORK_ERROR' | 'AUTH_ERROR' | 'RATE_LIMIT' | 'INVALID_REQUEST' | 'UNKNOWN';
  message: string;
}
