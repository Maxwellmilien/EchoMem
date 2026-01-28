<script lang="ts">
  import { onMount } from 'svelte';
  import { decks, settings, cards } from '$lib/stores';
  import { Modal } from '$lib/components';
  import { LANGUAGES } from '$lib/types/deck';
  import {
    getLLMProvider,
    configureLLMProvider,
    type LLMProviderType,
    type GenerationType,
    type GeneratedCard,
    GENERATION_TYPE_LABELS
  } from '$lib/services/llm';
  import type { LLMError } from '$lib/services/llm';
  import type { Deck } from '$lib/types/deck';

  let word = '';
  let sourceLang = 'en';
  let targetLang = 'fr';
  let selectedTypes: GenerationType[] = ['sentence', 'synonym'];
  let generatedCards: GeneratedCard[] = [];
  let selectedCards: Set<number> = new Set();
  let error: string | null = null;
  let loading = false;

  let showAddModal = false;
  let selectedDeckId: number | null = null;
  let allDecks: Deck[] = [];

  const allTypes: GenerationType[] = [
    'sentence',
    'conjugation',
    'declension',
    'synonym',
    'antonym',
    'collocation',
    'context'
  ];

  onMount(async () => {
    const s = await settings.load();
    configureLLMProvider(
      s.llmProvider as LLMProviderType,
      s.llmApiKey,
      s.llmModel
    );

    allDecks = await decks.load();
    if (allDecks.length > 0 && allDecks[0].id) {
      selectedDeckId = allDecks[0].id;
    }
  });

  function toggleType(type: GenerationType) {
    if (selectedTypes.includes(type)) {
      selectedTypes = selectedTypes.filter((t) => t !== type);
    } else {
      selectedTypes = [...selectedTypes, type];
    }
  }

  async function handleGenerate() {
    if (!word.trim() || selectedTypes.length === 0) return;

    loading = true;
    error = null;
    generatedCards = [];
    selectedCards = new Set();

    try {
      const s = await settings.load();
      const provider = getLLMProvider(s.llmProvider as LLMProviderType);
      const result = await provider.generate({
        word: word.trim(),
        sourceLang,
        targetLang,
        types: selectedTypes
      });
      generatedCards = result.cards;

      generatedCards.forEach((_, i) => selectedCards.add(i));
      selectedCards = selectedCards;
    } catch (e) {
      const err = e as LLMError;
      error = err.message || 'Generation failed';
    } finally {
      loading = false;
    }
  }

  function toggleCard(index: number) {
    if (selectedCards.has(index)) {
      selectedCards.delete(index);
    } else {
      selectedCards.add(index);
    }
    selectedCards = selectedCards;
  }

  function openAddModal() {
    if (selectedCards.size === 0) return;
    showAddModal = true;
  }

  async function handleAddCards() {
    if (!selectedDeckId || selectedCards.size === 0) return;

    const cardsToAdd = generatedCards
      .filter((_, i) => selectedCards.has(i))
      .map((c) => ({ front: c.front, back: c.back }));

    await cards.addBatch(selectedDeckId, cardsToAdd);
    showAddModal = false;

    word = '';
    generatedCards = [];
    selectedCards = new Set();
  }
</script>

<div class="page-container">
  <h1 class="page-title">Generate Cards</h1>

  <div class="space-y-4">
    <div>
      <label for="word" class="label">Word or phrase</label>
      <input
        type="text"
        id="word"
        bind:value={word}
        class="input"
        placeholder="Enter a word to generate cards for..."
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="srcLang" class="label">Source</label>
        <select id="srcLang" bind:value={sourceLang} class="input">
          {#each LANGUAGES as lang}
            <option value={lang.code}>{lang.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="tgtLang" class="label">Target</label>
        <select id="tgtLang" bind:value={targetLang} class="input">
          {#each LANGUAGES as lang}
            <option value={lang.code}>{lang.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <fieldset>
      <legend class="label">Card Types</legend>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Card type selection">
        {#each allTypes as type}
          <button
            class="px-3 py-1.5 rounded-full text-sm transition-colors {selectedTypes.includes(type)
              ? 'bg-primary-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
            on:click={() => toggleType(type)}
          >
            {GENERATION_TYPE_LABELS[type]}
          </button>
        {/each}
      </div>
    </fieldset>

    <button
      class="btn-primary w-full"
      on:click={handleGenerate}
      disabled={loading || !word.trim() || selectedTypes.length === 0}
    >
      {#if loading}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generating...
      {:else}
        Generate Cards
      {/if}
    </button>

    {#if error}
      <div class="card bg-red-900/30 border border-red-700">
        <p class="text-red-300">{error}</p>
      </div>
    {/if}

    {#if generatedCards.length > 0}
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-slate-200">Generated Cards</h3>
          <span class="text-sm text-slate-400">{selectedCards.size} selected</span>
        </div>

        {#each generatedCards as card, i}
          <button
            class="card w-full text-left transition-colors {selectedCards.has(i)
              ? 'ring-2 ring-primary-500'
              : 'opacity-60'}"
            on:click={() => toggleCard(i)}
          >
            <div class="flex items-start gap-3">
              <div
                class="w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center {selectedCards.has(i)
                  ? 'bg-primary-600 border-primary-600'
                  : 'border-slate-600'}"
              >
                {#if selectedCards.has(i)}
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs text-primary-400 font-medium">
                  {GENERATION_TYPE_LABELS[card.type]}
                </span>
                <p class="font-medium text-slate-100 mt-1">{card.front}</p>
                <p class="text-sm text-slate-400 mt-1">{card.back}</p>
              </div>
            </div>
          </button>
        {/each}

        <button
          class="btn-primary w-full"
          on:click={openAddModal}
          disabled={selectedCards.size === 0}
        >
          Add {selectedCards.size} Card{selectedCards.size !== 1 ? 's' : ''} to Deck
        </button>
      </div>
    {/if}
  </div>
</div>

<Modal bind:open={showAddModal} title="Add Cards to Deck" on:close={() => showAddModal = false}>
  <div class="space-y-4">
    <div>
      <label for="deck" class="label">Select Deck</label>
      <select id="deck" bind:value={selectedDeckId} class="input">
        {#each allDecks as deck}
          <option value={deck.id}>{deck.name}</option>
        {/each}
      </select>
    </div>

    <p class="text-slate-400">
      {selectedCards.size} card{selectedCards.size !== 1 ? 's' : ''} will be added to the selected deck.
    </p>

    <div class="flex gap-3">
      <button class="btn-secondary flex-1" on:click={() => showAddModal = false}>
        Cancel
      </button>
      <button
        class="btn-primary flex-1"
        on:click={handleAddCards}
        disabled={!selectedDeckId}
      >
        Add Cards
      </button>
    </div>
  </div>
</Modal>
