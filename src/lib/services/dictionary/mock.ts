import type { DictionaryProvider, DictionaryResult, DictionaryError } from './types';

const MOCK_DEFINITIONS: Record<string, DictionaryResult> = {
  hello: {
    word: 'hello',
    phonetic: '/hEloU/',
    meanings: [
      {
        partOfSpeech: 'interjection',
        definitions: [
          {
            definition: 'Used as a greeting or to begin a conversation.',
            example: 'Hello, how are you?',
            synonyms: ['hi', 'hey', 'greetings']
          }
        ]
      },
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'An utterance of "hello"; a greeting.',
            example: 'She gave me a warm hello.'
          }
        ]
      }
    ]
  },
  cat: {
    word: 'cat',
    phonetic: '/kaet/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition:
              'A small domesticated carnivorous mammal with soft fur, a short snout, and retractable claws.',
            example: 'The cat sat on the mat.',
            synonyms: ['feline', 'kitty', 'kitten']
          }
        ]
      }
    ]
  },
  book: {
    word: 'book',
    phonetic: '/bUk/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition:
              'A written or printed work consisting of pages bound together.',
            example: 'I read a book about history.',
            synonyms: ['volume', 'tome', 'publication']
          }
        ]
      },
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition: 'To reserve or make an arrangement in advance.',
            example: 'I need to book a hotel room.',
            synonyms: ['reserve', 'schedule']
          }
        ]
      }
    ]
  }
};

export class MockDictionaryProvider implements DictionaryProvider {
  name = 'Mock';
  requiresApiKey = false;

  async lookup(word: string, _lang: string): Promise<DictionaryResult> {
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));

    const lowerWord = word.toLowerCase().trim();
    const result = MOCK_DEFINITIONS[lowerWord];

    if (result) {
      return result;
    }

    const error: DictionaryError = {
      code: 'NOT_FOUND',
      message: `No definition found for "${word}"`
    };
    throw error;
  }

  isConfigured(): boolean {
    return true;
  }
}

export const mockDictionaryProvider = new MockDictionaryProvider();
