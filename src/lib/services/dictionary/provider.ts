import type { DictionaryProvider } from './types';
import { mockDictionaryProvider } from './mock';
import { freeDictionaryProvider } from './free-dictionary';
import { wiktionaryProvider } from './wiktionary';

export type DictionaryProviderType = 'mock' | 'free-dictionary' | 'wiktionary';

const providers: Record<DictionaryProviderType, DictionaryProvider> = {
  mock: mockDictionaryProvider,
  'free-dictionary': freeDictionaryProvider,
  wiktionary: wiktionaryProvider
};

export function getDictionaryProvider(type: DictionaryProviderType): DictionaryProvider {
  return providers[type] ?? mockDictionaryProvider;
}

export function configureDictionaryProvider(
  _type: DictionaryProviderType,
  _apiKey?: string
) {
  // Current providers don't require configuration.
  // This function exists for future providers that may need API keys.
}
