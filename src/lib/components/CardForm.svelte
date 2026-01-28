<script lang="ts">
  import type { Card } from '$lib/types/card';
  import { createEventDispatcher } from 'svelte';

  export let card: Partial<Card> = {};
  export let submitLabel: string = 'Add Card';

  const dispatch = createEventDispatcher<{
    submit: { front: string; back: string };
    cancel: void;
  }>();

  let front = card.front ?? '';
  let back = card.back ?? '';

  function handleSubmit() {
    if (!front.trim() || !back.trim()) return;
    dispatch('submit', {
      front: front.trim(),
      back: back.trim()
    });
  }

  export function reset() {
    front = '';
    back = '';
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div>
    <label for="front" class="label">Front (Question) *</label>
    <textarea
      id="front"
      bind:value={front}
      class="input min-h-[80px] resize-none"
      placeholder="Word or phrase to learn..."
      required
    ></textarea>
  </div>

  <div>
    <label for="back" class="label">Back (Answer) *</label>
    <textarea
      id="back"
      bind:value={back}
      class="input min-h-[80px] resize-none"
      placeholder="Translation or definition..."
      required
    ></textarea>
  </div>

  <div class="flex gap-3 pt-2">
    <button type="button" class="btn-secondary flex-1" on:click={() => dispatch('cancel')}>
      Cancel
    </button>
    <button
      type="submit"
      class="btn-primary flex-1"
      disabled={!front.trim() || !back.trim()}
    >
      {submitLabel}
    </button>
  </div>
</form>
