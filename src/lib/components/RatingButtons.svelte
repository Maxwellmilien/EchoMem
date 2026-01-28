<script lang="ts">
  import type { Rating } from '$lib/types/card';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ rate: Rating }>();

  const ratings: Array<{ value: Rating; label: string; color: string; shortcut: string }> = [
    { value: 'again', label: 'Again', color: 'bg-red-600 hover:bg-red-700', shortcut: '1' },
    { value: 'hard', label: 'Hard', color: 'bg-orange-600 hover:bg-orange-700', shortcut: '2' },
    { value: 'good', label: 'Good', color: 'bg-green-600 hover:bg-green-700', shortcut: '3' },
    { value: 'easy', label: 'Easy', color: 'bg-blue-600 hover:bg-blue-700', shortcut: '4' }
  ];

  function handleKeydown(event: KeyboardEvent) {
    const rating = ratings.find((r) => r.shortcut === event.key);
    if (rating) {
      event.preventDefault();
      dispatch('rate', rating.value);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="grid grid-cols-4 gap-2">
  {#each ratings as rating}
    <button
      class="btn {rating.color} text-white py-3 flex flex-col items-center"
      on:click={() => dispatch('rate', rating.value)}
    >
      <span class="font-medium">{rating.label}</span>
      <span class="text-xs opacity-75">{rating.shortcut}</span>
    </button>
  {/each}
</div>
