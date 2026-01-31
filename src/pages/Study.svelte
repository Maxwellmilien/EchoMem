<script lang="ts">
  import { onMount } from 'svelte';
  import { decks, cards, settings } from '$lib/stores';
  import { BackButton, StudyCard, RatingButtons, ProgressBar } from '$lib/components';
  import type { Card, Rating } from '$lib/types/card';
  import type { StudyDirection } from '$lib/types/card';
  import type { Deck } from '$lib/types/deck';

  export let params: { id: string; direction?: string };

  let deck: Deck | null = null;
  let studyQueue: Card[] = [];
  let currentIndex = 0;
  let showAnswer = false;
  let correct = 0;
  let sessionComplete = false;

  $: deckId = parseInt(params.id);
  $: direction = (params.direction === 'reverse' ? 'reverse' : 'forward') as StudyDirection;
  $: directionLabel = direction === 'forward' ? 'Normal' : 'Reverse';
  $: currentCard = studyQueue[currentIndex] ?? null;

  onMount(async () => {
    deck = (await decks.get(deckId)) ?? null;
    await settings.load();

    if (deck) {
      const settingsData = await settings.load();
      studyQueue = await cards.getStudyQueue(
        deckId,
        settingsData.dailyNewCards,
        settingsData.dailyReviewCards,
        direction
      );

      if (studyQueue.length === 0) {
        sessionComplete = true;
      }
    }
  });

  function handleReveal() {
    showAnswer = true;
  }

  async function handleRate(event: CustomEvent<Rating>) {
    const rating = event.detail;

    if (currentCard) {
      await cards.review(currentCard, rating, direction);

      if (rating !== 'again') {
        correct++;
      }
    }

    showAnswer = false;
    currentIndex++;

    if (currentIndex >= studyQueue.length) {
      sessionComplete = true;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === 'Space' && !showAnswer && currentCard) {
      event.preventDefault();
      handleReveal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="page-container">
  <BackButton href="#/deck/{deckId}" />

  <!-- Direction indicator -->
  <div class="mb-4 text-center">
    <span class="inline-block px-3 py-1 text-sm font-medium rounded bg-primary-500/20 text-primary-300">
      {directionLabel} Mode
    </span>
  </div>

  {#if sessionComplete}
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="w-20 h-20 mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 class="text-2xl font-bold text-slate-100 mb-2">Session Complete!</h1>

      {#if studyQueue.length > 0}
        <p class="text-slate-400 mb-6">
          You reviewed {studyQueue.length} card{studyQueue.length !== 1 ? 's' : ''} with {correct} correct.
        </p>
      {:else}
        <p class="text-slate-400 mb-6">
          No cards are due for review right now. Come back later!
        </p>
      {/if}

      <div class="flex gap-3">
        <a href="#/deck/{deckId}" class="btn-secondary">
          Back to Deck
        </a>
        {#if studyQueue.length > 0}
          <button
            class="btn-primary"
            on:click={() => {
              currentIndex = 0;
              correct = 0;
              sessionComplete = false;
              showAnswer = false;
            }}
          >
            Study Again
          </button>
        {/if}
      </div>
    </div>
  {:else if currentCard}
    <div class="mb-4">
      <ProgressBar current={currentIndex} total={studyQueue.length} {correct} />
    </div>

    <div class="mb-6">
      <StudyCard card={currentCard} {showAnswer} {direction} on:reveal={handleReveal} />
    </div>

    {#if showAnswer}
      <RatingButtons on:rate={handleRate} />
      <p class="text-center text-xs text-slate-500 mt-3">
        Press 1-4 or click to rate
      </p>
    {:else}
      <p class="text-center text-sm text-slate-500">
        Press Space or tap the card to reveal
      </p>
    {/if}
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
  {/if}
</div>
