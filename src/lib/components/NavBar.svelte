<script lang="ts">
  import { location } from 'svelte-spa-router';

  const navItems = [
    { path: '/', icon: 'home', label: 'Decks' },
    { path: '/translate', icon: 'translate', label: 'Translate' },
    { path: '/generate', icon: 'sparkles', label: 'Generate' },
    { path: '/settings', icon: 'settings', label: 'Settings' }
  ];

  function isActive(path: string, current: string): boolean {
    if (path === '/') {
      return current === '/' || current.startsWith('/deck');
    }
    return current.startsWith(path);
  }
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 safe-bottom z-50">
  <div class="flex justify-around items-center h-16 max-w-lg mx-auto">
    {#each navItems as item}
      <a
        href="#{item.path}"
        class="flex flex-col items-center justify-center w-full h-full transition-colors {isActive(item.path, $location) ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'}"
      >
        {#if item.icon === 'home'}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        {:else if item.icon === 'translate'}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        {:else if item.icon === 'sparkles'}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        {:else if item.icon === 'settings'}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        {/if}
        <span class="text-xs mt-1">{item.label}</span>
      </a>
    {/each}
  </div>
</nav>
