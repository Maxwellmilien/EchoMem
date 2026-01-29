export type {
  DictionaryProvider,
  DictionaryResult,
  DictionaryMeaning,
  DictionaryDefinition,
  DictionaryError
} from './types';
export { mockDictionaryProvider } from './mock';
export { freeDictionaryProvider } from './free-dictionary';
export { wiktionaryProvider } from './wiktionary';
export {
  getDictionaryProvider,
  configureDictionaryProvider,
  type DictionaryProviderType
} from './provider';
