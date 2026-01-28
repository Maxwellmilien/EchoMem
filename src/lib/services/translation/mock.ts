import type { TranslationProvider, TranslationResult } from './types';

const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  'en-fr': {
    hello: 'bonjour',
    world: 'monde',
    'hello world': 'bonjour le monde',
    cat: 'chat',
    dog: 'chien',
    house: 'maison',
    book: 'livre',
    water: 'eau',
    food: 'nourriture',
    love: 'amour',
    friend: 'ami',
    time: 'temps',
    day: 'jour',
    night: 'nuit',
    sun: 'soleil',
    moon: 'lune',
    'good morning': 'bonjour',
    'good night': 'bonne nuit',
    'thank you': 'merci',
    please: "s'il vous plaît",
    yes: 'oui',
    no: 'non'
  },
  'fr-en': {
    bonjour: 'hello',
    monde: 'world',
    'bonjour le monde': 'hello world',
    chat: 'cat',
    chien: 'dog',
    maison: 'house',
    livre: 'book',
    eau: 'water',
    nourriture: 'food',
    amour: 'love',
    ami: 'friend',
    temps: 'time',
    jour: 'day',
    nuit: 'night',
    soleil: 'sun',
    lune: 'moon',
    merci: 'thank you',
    oui: 'yes',
    non: 'no'
  }
};

export class MockTranslationProvider implements TranslationProvider {
  name = 'Mock';
  requiresApiKey = false;

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult> {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200));

    const key = `${sourceLang}-${targetLang}`;
    const translations = MOCK_TRANSLATIONS[key] || {};
    const lowerText = text.toLowerCase().trim();

    const translated = translations[lowerText];

    if (translated) {
      return {
        text: translated,
        detectedSourceLang: sourceLang,
        alternatives: this.getAlternatives(lowerText, key)
      };
    }

    return {
      text: `[${targetLang}] ${text}`,
      detectedSourceLang: sourceLang,
      alternatives: []
    };
  }

  private getAlternatives(text: string, langPair: string): string[] {
    const alternatives: string[] = [];

    if (text === 'hello' && langPair === 'en-fr') {
      alternatives.push('salut', 'coucou');
    }

    if (text === 'friend' && langPair === 'en-fr') {
      alternatives.push('copain', 'camarade');
    }

    return alternatives;
  }

  isConfigured(): boolean {
    return true;
  }
}

export const mockTranslationProvider = new MockTranslationProvider();
