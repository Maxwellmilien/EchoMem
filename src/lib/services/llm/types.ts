export type GenerationType =
  | 'sentence'
  | 'conjugation'
  | 'declension'
  | 'synonym'
  | 'antonym'
  | 'collocation'
  | 'context';

export interface GenerationRequest {
  word: string;
  sourceLang: string;
  targetLang: string;
  types: GenerationType[];
}

export interface GeneratedCard {
  type: GenerationType;
  front: string;
  back: string;
}

export interface GenerationResult {
  word: string;
  cards: GeneratedCard[];
}

export interface LLMProvider {
  name: string;
  requiresApiKey: boolean;

  generate(request: GenerationRequest): Promise<GenerationResult>;

  isConfigured(): boolean;
}

export interface LLMError {
  code: 'NETWORK_ERROR' | 'AUTH_ERROR' | 'RATE_LIMIT' | 'INVALID_REQUEST' | 'UNKNOWN';
  message: string;
}

export const GENERATION_TYPE_LABELS: Record<GenerationType, string> = {
  sentence: 'Example Sentence',
  conjugation: 'Conjugation',
  declension: 'Declension',
  synonym: 'Synonyms',
  antonym: 'Antonyms',
  collocation: 'Common Expressions',
  context: 'Context'
};
