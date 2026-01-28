<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { decks, cards, cardStats } from '$lib/stores';
  import { BackButton, EmptyState, Modal, DeckForm } from '$lib/components';
  import type { Deck } from '$lib/types/deck';
  import { LANGUAGES } from '$lib/types/deck';

  export let params: { id: string };

  let deck: Deck | null = null;
  let showEditModal = false;
  let showDeleteConfirm = false;

  $: deckId = parseInt(params.id);

  onMount(async () => {
    deck = (await decks.get(deckId)) ?? null;
    if (deck) {
      await cards.loadForDeck(deckId);
    }
  });

  function getLanguageName(code: string): string {
    const lang = LANGUAGES.find((l) => l.code === code);
    return lang?.name ?? code;
  }

  async function handleUpdateDeck(event: CustomEvent<{ name: string; description: string; sourceLang: string; targetLang: string }>) {
    const { name, description, sourceLang, targetLang } = event.detail;
    await decks.update(deckId, { name, description, sourceLang, targetLang });
    deck = (await decks.get(deckId)) ?? null;
    showEditModal = false;
  }

  async function handleDeleteDeck() {
    await decks.delete(deckId);
    push('/');
  }
</script>

<div class="page-container">
  <BackButton href="#/" />

  {#if deck}
    <div class="mb-6">
      <div class="flex justify-between items-start mb-2">
        <h1 class="page-title mb-0">{deck.name}</h1>
        <div class="flex gap-2">
          <button class="btn-ghost btn-sm" on:click={() => showEditModal = true} aria-label="Edit deck">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="btn-ghost btn-sm text-red-400" on:click={() => showDeleteConfirm = true} aria-label="Delete deck">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {#if deck.description}
        <p class="text-slate-400 mb-2">{deck.description}</p>
      {/if}

      <p class="text-sm text-slate-500">
        {getLanguageName(deck.sourceLang)} → {getLanguageName(deck.targetLang)}
      </p>
    </div>

    <div class="grid grid-cols-4 gap-2 mb-6">
      <div class="card text-center py-3">
        <p class="text-2xl font-bold text-slate-100">{$cardStats.total}</p>
        <p class="text-xs text-slate-500">Total</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-2xl font-bold text-blue-400">{$cardStats.new}</p>
        <p class="text-xs text-slate-500">New</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-2xl font-bold text-orange-400">{$cardStats.learning}</p>
        <p class="text-xs text-slate-500">Learning</p>
      </div>
      <div class="card text-center py-3">
        <p class="text-2xl font-bold text-green-400">{$cardStats.due}</p>
        <p class="text-xs text-slate-500">Due</p>
      </div>
    </div>

    <div class="space-y-3 mb-6">
      {#if $cardStats.due > 0 || $cardStats.new > 0}
        <a href="#/deck/{deckId}/study" class="btn-primary w-full py-4 text-lg">
          Study Now
          {#if $cardStats.due > 0}
            <span class="ml-2 opacity-75">({$cardStats.due} due)</span>
          {/if}
        </a>
      {/if}

      <div class="grid grid-cols-2 gap-3">
        <a href="#/deck/{deckId}/cards" class="btn-secondary text-center">
          View Cards
        </a>
        <a href="#/deck/{deckId}/card/new" class="btn-secondary text-center">
          Add Card
        </a>
      </div>
    </div>

    {#if $cardStats.total === 0}
      <EmptyState
        title="No cards yet"
        description="Add some cards to start learning"
        actionLabel="Add Card"
        actionHref="#/deck/{deckId}/card/new"
      />
    {/if}
  {:else}
    <EmptyState title="Deck not found" actionLabel="Go Home" actionHref="#/" />
  {/if}
</div>

<Modal bind:open={showEditModal} title="Edit Deck" on:close={() => showEditModal = false}>
  {#if deck}
    <DeckForm
      {deck}
      submitLabel="Save Changes"
      on:submit={handleUpdateDeck}
      on:cancel={() => showEditModal = false}
    />
  {/if}
</Modal>

<Modal bind:open={showDeleteConfirm} title="Delete Deck" on:close={() => showDeleteConfirm = false}>
  <p class="text-slate-300 mb-4">
    Are you sure you want to delete "{deck?.name}"? This will also delete all {$cardStats.total} card{$cardStats.total !== 1 ? 's' : ''} in this deck.
  </p>
  <div class="flex gap-3">
    <button class="btn-secondary flex-1" on:click={() => showDeleteConfirm = false}>
      Cancel
    </button>
    <button class="btn-danger flex-1" on:click={handleDeleteDeck}>
      Delete
    </button>
  </div>
</Modal>
