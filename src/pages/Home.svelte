<script lang="ts">
  import { onMount } from 'svelte';
  import { decks } from '$lib/stores';
  import { cards } from '$lib/stores';
  import { DeckCard, EmptyState, Modal, DeckForm } from '$lib/components';
  import type { Deck } from '$lib/types/deck';

  let showNewDeckModal = false;
  let dueCounts: Record<number, number> = {};

  onMount(async () => {
    await decks.load();
  });

  $: loadDueCounts($decks);

  async function loadDueCounts(deckList: Deck[]) {
    for (const deck of deckList) {
      if (deck.id) {
        const dueCards = await cards.getDueCards(deck.id);
        dueCounts[deck.id] = dueCards.length;
      }
    }
    dueCounts = dueCounts;
  }

  async function handleCreateDeck(event: CustomEvent<{ name: string; description: string; sourceLang: string; targetLang: string }>) {
    const { name, description, sourceLang, targetLang } = event.detail;
    await decks.add(name, description, sourceLang, targetLang);
    showNewDeckModal = false;
  }
</script>

<div class="page-container">
  <div class="flex justify-between items-center mb-6">
    <h1 class="page-title mb-0">My Decks</h1>
    <button class="btn-primary btn-sm" on:click={() => showNewDeckModal = true}>
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New
    </button>
  </div>

  {#if $decks.length === 0}
    <EmptyState
      title="No decks yet"
      description="Create your first deck to start learning"
      actionLabel="Create Deck"
      on:action={() => showNewDeckModal = true}
    />
  {:else}
    <div class="space-y-3">
      {#each $decks as deck (deck.id)}
        <DeckCard {deck} dueCount={dueCounts[deck.id ?? 0] ?? 0} />
      {/each}
    </div>
  {/if}
</div>

<Modal bind:open={showNewDeckModal} title="New Deck" on:close={() => showNewDeckModal = false}>
  <DeckForm on:submit={handleCreateDeck} on:cancel={() => showNewDeckModal = false} />
</Modal>
