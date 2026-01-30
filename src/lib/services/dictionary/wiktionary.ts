import type {
  DictionaryProvider,
  DictionaryResult,
  DictionaryMeaning,
  DictionaryError
} from './types';

interface WiktionaryDefinition {
  definition: string;
  examples?: string[];
}

interface WiktionaryEntry {
  partOfSpeech: string;
  language: string;
  definitions: WiktionaryDefinition[];
}

interface WiktionaryResponse {
  [lang: string]: WiktionaryEntry[];
}

export class WiktionaryProvider implements DictionaryProvider {
  name = 'Wiktionary';
  requiresApiKey = false;

  async lookup(word: string, lang: string): Promise<DictionaryResult> {
    const url = `https://${encodeURIComponent(lang)}.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.trim())}`;

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      const error: DictionaryError = {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to Wiktionary API'
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

    const data: WiktionaryResponse = await response.json();
    return this.parseResponse(word, data, lang);
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private parseResponse(word: string, data: WiktionaryResponse, lang: string): DictionaryResult {
    const meanings: DictionaryMeaning[] = [];

    // Filter by language code - only process entries for the requested language
    const langEntries = data[lang];

    if (langEntries && Array.isArray(langEntries)) {
      for (const entry of langEntries) {
        if (entry.definitions.length === 0) continue;

        meanings.push({
          partOfSpeech: entry.partOfSpeech,
          definitions: entry.definitions.slice(0, 5).map((d) => ({
            definition: this.stripHtml(d.definition),
            example:
              d.examples && d.examples.length > 0
                ? this.stripHtml(d.examples[0])
                : undefined
          }))
        });
      }
    }

    if (meanings.length === 0) {
      const error: DictionaryError = {
        code: 'NOT_FOUND',
        message: `No definition found for "${word}" in the requested language`
      };
      throw error;
    }

    return {
      word,
      meanings
    };
  }

  isConfigured(): boolean {
    return true;
  }
}

export const wiktionaryProvider = new WiktionaryProvider();
