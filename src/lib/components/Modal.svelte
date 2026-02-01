<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let open: boolean = false;
  export let title: string = '';

  const dispatch = createEventDispatcher<{ close: void }>();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      dispatch('close');
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      dispatch('close');
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
  >
    <div
      class="w-full sm:max-w-lg bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[100dvh] sm:max-h-[85vh] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {#if title}
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 id="modal-title" class="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            class="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            on:click={() => dispatch('close')}
            aria-label="Close"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/if}

      <div class="p-4 overflow-y-auto flex-1">
        <slot />
      </div>
    </div>
  </div>
{/if}
