<script lang="ts">
  import { onMount } from 'svelte';
  import { decks, settings } from '$lib/stores';
  import { cards } from '$lib/stores';
  import { Modal } from '$lib/components';
  import { LANGUAGES } from '$lib/types/deck';
  import {
    getTranslationProvider,
    configureTranslationProvider,
    type TranslationProviderType
  } from '$lib/services/translation';
  import type { TranslationResult, TranslationError } from '$lib/services/translation';
  import {
    getDictionaryProvider,
    type DictionaryProviderType
  } from '$lib/services/dictionary';
  import type { DictionaryResult, DictionaryError } from '$lib/services/dictionary';
  import type { Deck } from '$lib/types/deck';

  let text = '';
  let sourceLang = 'en';
  let targetLang = 'fr';
  let result: TranslationResult | null = null;
  let error: string | null = null;
  let loading = false;

  let dictResult: DictionaryResult | null = null;
  let dictError: string | null = null;
  let dictLoading = false;

  let showAddCardModal = false;
  let selectedDeckId: number | null = null;
  let cardFront = '';
  let cardBack = '';

  let allDecks: Deck[] = [];

  onMount(async () => {
    const s = await settings.load();
    configureTranslationProvider(
      s.translationProvider as TranslationProviderType,
      s.translationApiKey
    );

    allDecks = await decks.load();
    if (allDecks.length > 0 && allDecks[0].id) {
      selectedDeckId = allDecks[0].id;
    }
  });

  async function handleTranslate() {
    if (!text.trim()) return;

    loading = true;
    error = null;
    result = null;
    dictResult = null;
    dictError = null;

    try {
      const s = await settings.load();
      const provider = getTranslationProvider(s.translationProvider as TranslationProviderType);
      result = await provider.translate(text.trim(), sourceLang, targetLang);
    } catch (e) {
      const err = e as TranslationError;
      error = err.message || 'Translation failed';
    } finally {
      loading = false;
    }

    handleLookup();
  }

  async function handleLookup() {
    const word = text.trim();
    if (!word) return;

    dictLoading = true;
    dictError = null;
    dictResult = null;

    try {
      const s = await settings.load();
      const provider = getDictionaryProvider(s.dictionaryProvider as DictionaryProviderType);
      dictResult = await provider.lookup(word, sourceLang);
    } catch (e) {
      const err = e as DictionaryError;
      dictError = err.message || 'Dictionary lookup failed';
    } finally {
      dictLoading = false;
    }
  }

  function openAddCardModal() {
    if (!result) return;
    cardFront = text.trim();
    cardBack = result.text;
    showAddCardModal = true;
  }

  async function handleAddCard() {
    if (!selectedDeckId || !cardFront.trim() || !cardBack.trim()) return;

    await cards.add(selectedDeckId, cardFront.trim(), cardBack.trim());
    showAddCardModal = false;

    text = '';
    result = null;
  }

  function swapLanguages() {
    [sourceLang, targetLang] = [targetLang, sourceLang];
    if (result) {
      text = result.text;
      result = null;
    }
  }
</script>

<div class="page-container">
  <h1 class="page-title">Translate</h1>

  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <select bind:value={sourceLang} class="input flex-1">
        {#each LANGUAGES as lang}
          <option value={lang.code}>{lang.name}</option>
        {/each}
      </select>

      <button
        class="btn-ghost p-2"
        on:click={swapLanguages}
        title="Swap languages"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>

      <select bind:value={targetLang} class="input flex-1">
        {#each LANGUAGES as lang}
          <option value={lang.code}>{lang.name}</option>
        {/each}
      </select>
    </div>

    <div>
      <textarea
        bind:value={text}
        class="input min-h-[100px] resize-none"
        placeholder="Enter text to translate..."
        on:keydown={(e) => e.key === 'Enter' && e.ctrlKey && handleTranslate()}
      ></textarea>
    </div>

    <button
      class="btn-primary w-full"
      on:click={handleTranslate}
      disabled={loading || dictLoading || !text.trim()}
    >
      {#if loading || dictLoading}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Searching...
      {:else}
        Translate & Look up
      {/if}
    </button>

    {#if error}
      <div class="card bg-red-900/30 border border-red-700">
        <p class="text-red-300">{error}</p>
      </div>
    {/if}

    {#if result && !dictResult}
      <div class="card">
        <h3 class="text-sm font-medium text-slate-400 mb-2">Translation</h3>
        <p class="text-xl text-slate-100">{result.text}</p>

        {#if result.alternatives && result.alternatives.length > 0}
          <div class="mt-3 pt-3 border-t border-slate-700">
            <h4 class="text-xs font-medium text-slate-500 mb-1">Alternatives</h4>
            <p class="text-sm text-slate-400">{result.alternatives.join(', ')}</p>
          </div>
        {/if}

        <div class="mt-4 pt-4 border-t border-slate-700">
          <button class="btn-primary w-full" on:click={openAddCardModal}>
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Flashcard
          </button>
        </div>
      </div>
    {/if}

    {#if dictError}
      <div class="card bg-yellow-900/20 border border-yellow-700/50">
        <p class="text-yellow-300 text-sm">{dictError}</p>
      </div>
    {/if}

    {#if dictResult}
      <div class="card">
        <h3 class="text-sm font-medium text-slate-400 mb-2">Dictionary</h3>

        <div class="flex items-baseline gap-3 mb-3">
          <span class="text-xl font-semibold text-slate-100">{dictResult.word}</span>
          {#if dictResult.phonetic}
            <span class="text-sm text-slate-400">{dictResult.phonetic}</span>
          {/if}
        </div>

        <div class="space-y-4">
          {#each dictResult.meanings as meaning}
            <div>
              <h4 class="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">
                {meaning.partOfSpeech}
              </h4>
              <ol class="space-y-2">
                {#each meaning.definitions as def, i}
                  <li class="text-sm text-slate-300">
                    <span class="text-slate-500 mr-1">{i + 1}.</span>
                    {def.definition}
                    {#if def.example}
                      <p class="text-slate-500 italic mt-0.5 ml-4">"{def.example}"</p>
                    {/if}
                    {#if def.synonyms && def.synonyms.length > 0}
                      <p class="text-slate-500 mt-0.5 ml-4">
                        <span class="text-slate-600">Synonyms:</span> {def.synonyms.join(', ')}
                      </p>
                    {/if}
                  </li>
                {/each}
              </ol>
            </div>
          {/each}
        </div>

        {#if result}
          <div class="mt-4 pt-4 border-t border-slate-700">
            <button class="btn-primary w-full" on:click={openAddCardModal}>
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Flashcard
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<Modal bind:open={showAddCardModal} title="Create Flashcard" on:close={() => showAddCardModal = false}>
  <div class="space-y-4">
    <div>
      <label for="deck" class="label">Add to Deck</label>
      <select id="deck" bind:value={selectedDeckId} class="input">
        {#each allDecks as deck}
          <option value={deck.id}>{deck.name}</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="front" class="label">Front (Question)</label>
      <textarea
        id="front"
        bind:value={cardFront}
        class="input min-h-[60px] resize-none"
      ></textarea>
    </div>

    <div>
      <label for="back" class="label">Back (Answer)</label>
      <textarea
        id="back"
        bind:value={cardBack}
        class="input min-h-[60px] resize-none"
      ></textarea>
    </div>

    <div class="flex gap-3">
      <button class="btn-secondary flex-1" on:click={() => showAddCardModal = false}>
        Cancel
      </button>
      <button
        class="btn-primary flex-1"
        on:click={handleAddCard}
        disabled={!selectedDeckId || !cardFront.trim() || !cardBack.trim()}
      >
        Add Card
      </button>
    </div>
  </div>
</Modal>
