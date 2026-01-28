export interface Settings {
  id: number;
  translationProvider: string;
  translationApiKey?: string;
  llmProvider: string;
  llmApiKey?: string;
  llmModel?: string;
  dailyNewCards: number;
  dailyReviewCards: number;
  theme: 'dark' | 'light' | 'system';
}

export function createDefaultSettings(): Settings {
  return {
    id: 1,
    translationProvider: 'mock',
    llmProvider: 'mock',
    dailyNewCards: 20,
    dailyReviewCards: 100,
    theme: 'dark'
  };
}
