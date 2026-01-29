import type { DictionaryProvider, DictionaryResult, DictionaryError } from './types';

interface FreeDictPhonetic {
  text?: string;
  audio?: string;
}

interface FreeDictDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
}

interface FreeDictMeaning {
  partOfSpeech: string;
  definitions: FreeDictDefinition[];
  synonyms?: string[];
}

interface FreeDictEntry {
  word: string;
  phonetic?: string;
  phonetics?: FreeDictPhonetic[];
  meanings: FreeDictMeaning[];
}

export class FreeDictionaryProvider implements DictionaryProvider {
  name = 'Free Dictionary';
  requiresApiKey = false;

  async lookup(word: string, lang: string): Promise<DictionaryResult> {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/${encodeURIComponent(lang)}/${encodeURIComponent(word.trim())}`;

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      const error: DictionaryError = {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to Free Dictionary API'
      };
      throw error;
    }

    if (response.status === 404) {
      const error: DictionaryError = {
        code: 'NOT_FOUND',
        message: `No definition found for "${word}"`
      };
      throw error;
    }

    if (response.status === 429) {
      const error: DictionaryError = {
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please try again later.'
      };
      throw error;
    }

    if (!response.ok) {
      const error: DictionaryError = {
        code: 'UNKNOWN',
        message: `API error: ${response.status}`
      };
      throw error;
    }

    const data: FreeDictEntry[] = await response.json();
    return this.parseResponse(data);
  }

  private parseResponse(entries: FreeDictEntry[]): DictionaryResult {
    const entry = entries[0];

    const phonetic =
      entry.phonetic ||
      entry.phonetics?.find((p) => p.text)?.text;

    return {
      word: entry.word,
      phonetic,
      meanings: entry.meanings.map((m) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions.slice(0, 5).map((d) => ({
          definition: d.definition,
          example: d.example,
          synonyms:
            d.synonyms && d.synonyms.length > 0
              ? d.synonyms.slice(0, 5)
              : m.synonyms && m.synonyms.length > 0
                ? m.synonyms.slice(0, 5)
                : undefined
        }))
      }))
    };
  }

  isConfigured(): boolean {
    return true;
  }
}

export const freeDictionaryProvider = new FreeDictionaryProvider();
