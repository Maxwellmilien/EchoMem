<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { cards } from '$lib/stores';
  import { BackButton, CardForm } from '$lib/components';
  import type { Card } from '$lib/types/card';

  export let params: { id: string; cardId: string };

  let card: Card | null = null;

  $: deckId = parseInt(params.id);
  $: cardId = parseInt(params.cardId);

  onMount(async () => {
    card = (await cards.get(cardId)) ?? null;
  });

  async function handleUpdateCard(event: CustomEvent<{ front: string; back: string }>) {
    const { front, back } = event.detail;
    await cards.update(cardId, { front, back });
    push(`/deck/${deckId}/cards`);
  }
</script>

<div class="page-container">
  <BackButton href="#/deck/{deckId}/cards" />

  <h1 class="page-title">Edit Card</h1>

  {#if card}
    <CardForm
      {card}
      submitLabel="Save Changes"
      on:submit={handleUpdateCard}
      on:cancel={() => push(`/deck/${deckId}/cards`)}
    />
  {:else}
    <p class="text-slate-400">Card not found</p>
  {/if}
</div>
