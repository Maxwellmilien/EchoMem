
export interface ExportSettings {
  translationProvider: string;
  translationApiKey?: string;
  llmProvider: string;
  llmApiKey?: string;
  llmModel?: string;
  dictionaryProvider: string;
  dictionaryApiKey?: string;
  dailyNewCards: number;
  dailyReviewCards: number;
  theme: 'dark' | 'light' | 'system';
}

export interface ExportCard {
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
  forwardSrsData: ExportSRSData;
  reverseSrsData: ExportSRSData;
}

export interface ExportSRSData {
  due: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  lastReview?: string;
}

export interface ExportDeck {
  deck: {
    name: string;
    description: string;
    sourceLang: string;
    targetLang: string;
    createdAt: string;
    updatedAt: string;
    cardCount: number;
    reverseMode: boolean;
  };
  cards: ExportCard[];
}

export interface ExportData {
  version: number;
  exportedAt: string;
  settings?: ExportSettings;
  decks?: ExportDeck[];
}
