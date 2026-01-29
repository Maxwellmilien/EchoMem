import type { LLMProvider } from './types';
import { mockLLMProvider } from './mock';
import { openaiProvider } from './openai';
import { anthropicProvider } from './anthropic';
import { ollamaProvider } from './ollama';
import { mistralProvider } from './mistral';

export type LLMProviderType = 'mock' | 'openai' | 'anthropic' | 'ollama' | 'mistral';

const providers: Record<LLMProviderType, LLMProvider> = {
  mock: mockLLMProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  ollama: ollamaProvider,
  mistral: mistralProvider
};

export function getLLMProvider(type: LLMProviderType): LLMProvider {
  return providers[type] ?? mockLLMProvider;
}

export function configureLLMProvider(
  type: LLMProviderType,
  apiKey?: string,
  model?: string,
  options?: Record<string, unknown>
) {
  switch (type) {
    case 'openai':
      openaiProvider.configure(apiKey ?? '', model);
      break;
    case 'anthropic':
      anthropicProvider.configure(apiKey ?? '', model);
      break;
    case 'ollama':
      ollamaProvider.configure(model, options?.baseUrl as string);
      break;
    case 'mistral':
      mistralProvider.configure(apiKey ?? '', model);
      break;
  }
}
