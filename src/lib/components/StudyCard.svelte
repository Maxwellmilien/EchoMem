<script lang="ts">
  import type { Card, StudyDirection } from '$lib/types/card';
  import { createEventDispatcher } from 'svelte';

  export let card: Card;
  export let showAnswer: boolean = false;
  export let direction: StudyDirection = 'forward';

  const dispatch = createEventDispatcher<{ reveal: void }>();

  // Swap front/back based on direction
  $: frontContent = direction === 'forward' ? card.front : card.back;
  $: backContent = direction === 'forward' ? card.back : card.front;
</script>

<div class="card min-h-[200px] flex flex-col">
  <div class="flex-1 flex flex-col items-center justify-center text-center p-4">
    <p class="text-xl font-medium text-slate-100 mb-4">{frontContent}</p>

    {#if showAnswer}
      <div class="w-full border-t border-slate-700 pt-4 mt-2">
        <p class="text-lg text-primary-300">{backContent}</p>
      </div>
    {/if}
  </div>

  {#if !showAnswer}
    <button
      class="w-full py-4 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-b-xl transition-colors border-t border-slate-700"
      on:click={() => dispatch('reveal')}
    >
      Tap to reveal answer
    </button>
  {/if}
</div>
