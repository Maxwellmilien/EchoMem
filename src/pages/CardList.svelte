<script lang="ts">
  import { onMount } from 'svelte';
  import { decks, cards } from '$lib/stores';
  import { BackButton, CardItem, EmptyState, Modal } from '$lib/components';
  import type { Deck } from '$lib/types/deck';
  import type { Card } from '$lib/types/card';

  export let params: { id: string };

  let deck: Deck | null = null;
  let selectedCard: Card | null = null;
  let showDeleteConfirm = false;

  $: deckId = parseInt(params.id);

  onMount(async () => {
    deck = (await decks.get(deckId)) ?? null;
    if (deck) {
      await cards.loadForDeck(deckId);
    }
  });

  async function handleDeleteCard() {
    if (selectedCard?.id) {
      await cards.delete(selectedCard.id, deckId);
      showDeleteConfirm = false;
      selectedCard = null;
    }
  }
</script>

<div class="page-container">
  <BackButton href="#/deck/{deckId}" />

  <div class="flex justify-between items-center mb-6">
    <h1 class="page-title mb-0">Cards</h1>
    <a href="#/deck/{deckId}/card/new" class="btn-primary btn-sm">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Add
    </a>
  </div>

  {#if $cards.length === 0}
    <EmptyState
      title="No cards yet"
      description="Add some cards to start learning"
      actionLabel="Add Card"
      actionHref="#/deck/{deckId}/card/new"
    />
  {:else}
    <div class="space-y-3">
      {#each $cards as card (card.id)}
        <div class="relative">
          <a href="#/deck/{deckId}/card/{card.id}" class="block">
            <CardItem {card} />
          </a>
          <button
            class="absolute top-2 right-2 p-2 text-slate-500 hover:text-red-400 transition-colors"
            on:click|preventDefault={() => {
              selectedCard = card;
              showDeleteConfirm = true;
            }}
            aria-label="Delete card"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<Modal bind:open={showDeleteConfirm} title="Delete Card" on:close={() => showDeleteConfirm = false}>
  <p class="text-slate-300 mb-4">
    Are you sure you want to delete this card?
  </p>
  {#if selectedCard}
    <div class="card mb-4">
      <p class="font-medium text-slate-100">{selectedCard.front}</p>
      <p class="text-sm text-slate-400 mt-1">{selectedCard.back}</p>
    </div>
  {/if}
  <div class="flex gap-3">
    <button class="btn-secondary flex-1" on:click={() => showDeleteConfirm = false}>
      Cancel
    </button>
    <button class="btn-danger flex-1" on:click={handleDeleteCard}>
      Delete
    </button>
  </div>
</Modal>
