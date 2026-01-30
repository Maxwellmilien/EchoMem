import type { TranslationProvider } from './types';
import { mockTranslationProvider } from './mock';
import { deeplTranslationProvider } from './deepl';
import { libreTranslateProvider } from './libretranslate';
import { googleTranslationProvider } from './google';

export type TranslationProviderType = 'mock' | 'deepl' | 'google' | 'libretranslate';

const providers: Record<TranslationProviderType, TranslationProvider> = {
  mock: mockTranslationProvider,
  deepl: deeplTranslationProvider,
  google: googleTranslationProvider,
  libretranslate: libreTranslateProvider
};

export function getTranslationProvider(type: TranslationProviderType): TranslationProvider {
  return providers[type] ?? mockTranslationProvider;
}

export function configureTranslationProvider(
  type: TranslationProviderType,
  apiKey?: string,
  options?: Record<string, unknown>
) {
  switch (type) {
    case 'deepl':
      deeplTranslationProvider.configure(apiKey ?? '', options?.usePro as boolean);
      break;
    case 'google':
      googleTranslationProvider.configure(apiKey ?? '');
      break;
    case 'libretranslate':
      libreTranslateProvider.configure(apiKey, options?.baseUrl as string);
      break;
  }
}
