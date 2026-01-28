import type { LLMProvider, GenerationRequest, GenerationResult, GeneratedCard, GenerationType } from './types';

const MOCK_RESPONSES: Record<string, Record<GenerationType, { front: string; back: string }>> = {
  'hello:en:fr': {
    sentence: {
      front: 'Complete: "___! Comment allez-vous?"',
      back: 'Bonjour! Comment allez-vous?'
    },
    conjugation: {
      front: 'N/A - "hello" is not a verb',
      back: 'Bonjour is an interjection, not conjugated'
    },
    declension: {
      front: 'What is the plural of "bonjour"?',
      back: 'Bonjours (rarely used)'
    },
    synonym: {
      front: 'What are synonyms for "bonjour"?',
      back: 'Salut, Coucou, Bonsoir (evening)'
    },
    antonym: {
      front: 'What is the opposite of "bonjour"?',
      back: 'Au revoir (goodbye)'
    },
    collocation: {
      front: 'Common expressions with "bonjour"',
      back: 'Bonjour à tous, Dire bonjour, Un simple bonjour'
    },
    context: {
      front: 'When do you use "bonjour"?',
      back: 'Formal greeting used during daytime. Use "bonsoir" after 6pm.'
    }
  },
  'default:en:fr': {
    sentence: {
      front: 'Use this word in a sentence',
      back: 'Example sentence with the word in context'
    },
    conjugation: {
      front: 'Conjugate this verb',
      back: 'je -, tu -, il/elle -, nous -, vous -, ils/elles -'
    },
    declension: {
      front: 'What are the forms of this word?',
      back: 'Singular/Plural, Masculine/Feminine forms'
    },
    synonym: {
      front: 'What are synonyms for this word?',
      back: 'Similar words in the target language'
    },
    antonym: {
      front: 'What is the opposite of this word?',
      back: 'Opposite word in the target language'
    },
    collocation: {
      front: 'Common expressions with this word',
      back: 'Frequently used phrases and collocations'
    },
    context: {
      front: 'When/how to use this word?',
      back: 'Usage notes and context for the word'
    }
  }
};

export class MockLLMProvider implements LLMProvider {
  name = 'Mock';
  requiresApiKey = false;

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    const key = `${request.word.toLowerCase()}:${request.sourceLang}:${request.targetLang}`;
    const responses = MOCK_RESPONSES[key] || MOCK_RESPONSES[`default:${request.sourceLang}:${request.targetLang}`] || MOCK_RESPONSES['default:en:fr'];

    const cards: GeneratedCard[] = request.types
      .filter((type) => responses[type])
      .map((type) => ({
        type,
        front: responses[type].front.replace(/this word/g, request.word),
        back: responses[type].back
      }));

    return {
      word: request.word,
      cards
    };
  }

  isConfigured(): boolean {
    return true;
  }
}

export const mockLLMProvider = new MockLLMProvider();
