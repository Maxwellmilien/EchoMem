<script lang="ts">
  export let title: string;
  export let description: string = '';
  export let actionLabel: string = '';
  export let actionHref: string = '';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ action: void }>();
</script>

<div class="flex flex-col items-center justify-center py-12 px-4 text-center">
  <div class="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
    <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  </div>

  <h3 class="text-lg font-medium text-slate-300 mb-1">{title}</h3>

  {#if description}
    <p class="text-sm text-slate-500 mb-4 max-w-xs">{description}</p>
  {/if}

  {#if actionLabel}
    {#if actionHref}
      <a href={actionHref} class="btn-primary">
        {actionLabel}
      </a>
    {:else}
      <button class="btn-primary" on:click={() => dispatch('action')}>
        {actionLabel}
      </button>
    {/if}
  {/if}
</div>
