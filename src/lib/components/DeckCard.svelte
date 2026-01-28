<script lang="ts">
  import type { Deck } from '$lib/types/deck';
  import { LANGUAGES } from '$lib/types/deck';

  export let deck: Deck;
  export let dueCount: number = 0;

  function getLanguageName(code: string): string {
    const lang = LANGUAGES.find((l) => l.code === code);
    return lang?.name ?? code;
  }
</script>

<a href="#/deck/{deck.id}" class="card block hover:bg-slate-700/50 transition-colors">
  <div class="flex justify-between items-start mb-2">
    <h3 class="text-lg font-semibold text-slate-100 truncate flex-1">{deck.name}</h3>
    {#if dueCount > 0}
      <span class="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
        {dueCount}
      </span>
    {/if}
  </div>

  {#if deck.description}
    <p class="text-sm text-slate-400 mb-3 line-clamp-2">{deck.description}</p>
  {/if}

  <div class="flex items-center justify-between text-xs text-slate-500">
    <span>{getLanguageName(deck.sourceLang)} → {getLanguageName(deck.targetLang)}</span>
    <span>{deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}</span>
  </div>
</a>
