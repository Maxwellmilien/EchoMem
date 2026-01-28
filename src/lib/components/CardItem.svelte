<script lang="ts">
  import type { Card } from '$lib/types/card';

  export let card: Card;

  function getStateColor(state: string): string {
    switch (state) {
      case 'new':
        return 'bg-blue-500';
      case 'learning':
      case 'relearning':
        return 'bg-orange-500';
      case 'review':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  }

  function getStateLabel(state: string): string {
    switch (state) {
      case 'new':
        return 'New';
      case 'learning':
        return 'Learning';
      case 'relearning':
        return 'Relearning';
      case 'review':
        return 'Review';
      default:
        return state;
    }
  }
</script>

<div class="card">
  <div class="flex justify-between items-start gap-2 mb-2">
    <p class="font-medium text-slate-100 flex-1">{card.front}</p>
    <span
      class="px-2 py-0.5 text-xs font-medium text-white rounded {getStateColor(card.srsData.state)}"
    >
      {getStateLabel(card.srsData.state)}
    </span>
  </div>
  <p class="text-sm text-slate-400">{card.back}</p>
</div>
