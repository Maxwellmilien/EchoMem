<script lang="ts">
  import type { Deck } from '$lib/types/deck';
  import { LANGUAGES } from '$lib/types/deck';
  import { createEventDispatcher } from 'svelte';

  export let deck: Partial<Deck> = {};
  export let submitLabel: string = 'Create Deck';

  const dispatch = createEventDispatcher<{
    submit: { name: string; description: string; sourceLang: string; targetLang: string };
    cancel: void;
  }>();

  let name = deck.name ?? '';
  let description = deck.description ?? '';
  let sourceLang = deck.sourceLang ?? 'en';
  let targetLang = deck.targetLang ?? 'fr';

  function handleSubmit() {
    if (!name.trim()) return;
    dispatch('submit', {
      name: name.trim(),
      description: description.trim(),
      sourceLang,
      targetLang
    });
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div>
    <label for="name" class="label">Name *</label>
    <input
      type="text"
      id="name"
      bind:value={name}
      class="input"
      placeholder="e.g., French Vocabulary"
      required
    />
  </div>

  <div>
    <label for="description" class="label">Description</label>
    <textarea
      id="description"
      bind:value={description}
      class="input min-h-[80px] resize-none"
      placeholder="Optional description..."
    ></textarea>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="sourceLang" class="label">Source Language</label>
      <select id="sourceLang" bind:value={sourceLang} class="input">
        {#each LANGUAGES as lang}
          <option value={lang.code}>{lang.name}</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="targetLang" class="label">Target Language</label>
      <select id="targetLang" bind:value={targetLang} class="input">
        {#each LANGUAGES as lang}
          <option value={lang.code}>{lang.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="flex gap-3 pt-2">
    <button type="button" class="btn-secondary flex-1" on:click={() => dispatch('cancel')}>
      Cancel
    </button>
    <button type="submit" class="btn-primary flex-1" disabled={!name.trim()}>
      {submitLabel}
    </button>
  </div>
</form>
