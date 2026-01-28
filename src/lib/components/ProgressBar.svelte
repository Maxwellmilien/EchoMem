<script lang="ts">
  export let current: number;
  export let total: number;
  export let correct: number = 0;

  $: percentage = total > 0 ? (current / total) * 100 : 0;
</script>

<div class="space-y-1">
  <div class="flex justify-between text-sm text-slate-400">
    <span>{current} / {total}</span>
    {#if correct > 0}
      <span class="text-green-400">{correct} correct</span>
    {/if}
  </div>
  <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
    <div
      class="h-full bg-primary-500 transition-all duration-300"
      style="width: {percentage}%"
    ></div>
  </div>
</div>
