export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  meanings: DictionaryMeaning[];
}

export interface DictionaryProvider {
  name: string;
  requiresApiKey: boolean;

  lookup(word: string, lang: string): Promise<DictionaryResult>;

  isConfigured(): boolean;
}

export interface DictionaryError {
  code: 'NETWORK_ERROR' | 'NOT_FOUND' | 'AUTH_ERROR' | 'RATE_LIMIT' | 'UNKNOWN';
  message: string;
}
