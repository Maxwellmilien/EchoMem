<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let selected: boolean = false;
  export let label: string;
  export let description: string = '';
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{ toggle: void }>();

  function handleClick() {
    if (!disabled) {
      selected = !selected;
      dispatch('toggle');
    }
  }
</script>

<button
  class="w-full text-left transition-all duration-200 {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
  on:click={handleClick}
  {disabled}
  on:keydown={(e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  }}
>
  <div
    class="flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 {selected
      ? 'border-primary-500 bg-primary-600/15'
      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'}"
  >
    <div
      class="mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 {selected
        ? 'bg-primary-600 border-primary-500'
        : 'border-slate-600 bg-slate-700/50'}"
    >
      {#if selected}
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      {/if}
    </div>

    <div class="flex-1 min-w-0">
      <p class="font-medium text-slate-100">{label}</p>
      {#if description}
        <p class="text-sm text-slate-400 mt-1">{description}</p>
      {/if}
    </div>
  </div>
</button>

<style>
  button:active div {
    transform: scale(0.98);
  }
</style>
