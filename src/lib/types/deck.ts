export interface Deck {
  id?: number;
  name: string;
  description: string;
  sourceLang: string;
  targetLang: string;
  createdAt: Date;
  updatedAt: Date;
  cardCount: number;
  syncId?: string;
  syncStatus?: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
}

export function createDeck(
  name: string,
  description: string,
  sourceLang: string,
  targetLang: string
): Omit<Deck, 'id'> {
  const now = new Date();
  return {
    name,
    description,
    sourceLang,
    targetLang,
    createdAt: now,
    updatedAt: now,
    cardCount: 0
  };
}

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'sv', name: 'Svenska' },
  { code: 'da', name: 'Dansk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'no', name: 'Norsk' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'he', name: 'עברית' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'uk', name: 'Українська' },
  { code: 'cs', name: 'Čeština' },
  { code: 'ro', name: 'Română' },
  { code: 'hu', name: 'Magyar' }
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];
