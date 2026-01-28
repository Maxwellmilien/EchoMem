<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { decks, cards } from '$lib/stores';
  import { BackButton, CardForm } from '$lib/components';
  import type { Deck } from '$lib/types/deck';

  export let params: { id: string };

  let deck: Deck | null = null;
  let cardForm: CardForm;
  let addAnother = false;

  $: deckId = parseInt(params.id);

  onMount(async () => {
    deck = (await decks.get(deckId)) ?? null;
  });

  async function handleAddCard(event: CustomEvent<{ front: string; back: string }>) {
    const { front, back } = event.detail;
    await cards.add(deckId, front, back);

    if (addAnother) {
      cardForm.reset();
    } else {
      push(`/deck/${deckId}`);
    }
  }
</script>

<div class="page-container">
  <BackButton href="#/deck/{deckId}" />

  <h1 class="page-title">Add Card</h1>

  {#if deck}
    <p class="text-slate-400 mb-6">Adding to: {deck.name}</p>

    <CardForm
      bind:this={cardForm}
      on:submit={handleAddCard}
      on:cancel={() => push(`/deck/${deckId}`)}
    />

    <label class="flex items-center mt-4 text-sm text-slate-400">
      <input
        type="checkbox"
        bind:checked={addAnother}
        class="mr-2 rounded border-slate-600 bg-slate-800 text-primary-600 focus:ring-primary-500"
      />
      Add another card after saving
    </label>
  {/if}
</div>
