<script lang="ts">
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores';

  let dailyNewCards = 20;
  let dailyReviewCards = 100;
  let translationProvider = 'mock';
  let translationApiKey = '';
  let llmProvider = 'mock';
  let llmApiKey = '';
  let llmModel = '';

  onMount(async () => {
    const s = await settings.load();
    dailyNewCards = s.dailyNewCards;
    dailyReviewCards = s.dailyReviewCards;
    translationProvider = s.translationProvider;
    translationApiKey = s.translationApiKey ?? '';
    llmProvider = s.llmProvider;
    llmApiKey = s.llmApiKey ?? '';
    llmModel = s.llmModel ?? '';
  });

  async function saveStudySettings() {
    await settings.update({ dailyNewCards, dailyReviewCards });
  }

  async function saveTranslationSettings() {
    await settings.update({
      translationProvider,
      translationApiKey: translationApiKey || undefined
    });
  }

  async function saveLLMSettings() {
    await settings.update({
      llmProvider,
      llmApiKey: llmApiKey || undefined,
      llmModel: llmModel || undefined
    });
  }
</script>

<div class="page-container">
  <h1 class="page-title">Settings</h1>

  <div class="space-y-6">
    <section class="card">
      <h2 class="text-lg font-semibold text-slate-100 mb-4">Study Settings</h2>

      <div class="space-y-4">
        <div>
          <label for="dailyNew" class="label">Daily New Cards</label>
          <input
            type="number"
            id="dailyNew"
            bind:value={dailyNewCards}
            on:change={saveStudySettings}
            min="0"
            max="100"
            class="input"
          />
        </div>

        <div>
          <label for="dailyReview" class="label">Daily Review Cards</label>
          <input
            type="number"
            id="dailyReview"
            bind:value={dailyReviewCards}
            on:change={saveStudySettings}
            min="0"
            max="500"
            class="input"
          />
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="text-lg font-semibold text-slate-100 mb-4">Translation API</h2>

      <div class="space-y-4">
        <div>
          <label for="transProvider" class="label">Provider</label>
          <select
            id="transProvider"
            bind:value={translationProvider}
            on:change={saveTranslationSettings}
            class="input"
          >
            <option value="mock">Mock (Demo)</option>
            <option value="deepl">DeepL</option>
            <option value="libretranslate">LibreTranslate</option>
          </select>
        </div>

        {#if translationProvider !== 'mock'}
          <div>
            <label for="transApiKey" class="label">API Key</label>
            <input
              type="password"
              id="transApiKey"
              bind:value={translationApiKey}
              on:change={saveTranslationSettings}
              class="input"
              placeholder="Enter your API key"
            />
          </div>
        {/if}
      </div>
    </section>

    <section class="card">
      <h2 class="text-lg font-semibold text-slate-100 mb-4">LLM API</h2>

      <div class="space-y-4">
        <div>
          <label for="llmProvider" class="label">Provider</label>
          <select
            id="llmProvider"
            bind:value={llmProvider}
            on:change={saveLLMSettings}
            class="input"
          >
            <option value="mock">Mock (Demo)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="ollama">Ollama (Local)</option>
          </select>
        </div>

        {#if llmProvider !== 'mock' && llmProvider !== 'ollama'}
          <div>
            <label for="llmApiKey" class="label">API Key</label>
            <input
              type="password"
              id="llmApiKey"
              bind:value={llmApiKey}
              on:change={saveLLMSettings}
              class="input"
              placeholder="Enter your API key"
            />
          </div>
        {/if}

        {#if llmProvider !== 'mock'}
          <div>
            <label for="llmModel" class="label">Model</label>
            <input
              type="text"
              id="llmModel"
              bind:value={llmModel}
              on:change={saveLLMSettings}
              class="input"
              placeholder={llmProvider === 'openai' ? 'gpt-4o-mini' : llmProvider === 'anthropic' ? 'claude-3-haiku-20240307' : 'llama2'}
            />
          </div>
        {/if}
      </div>
    </section>

    <section class="card">
      <h2 class="text-lg font-semibold text-slate-100 mb-4">About</h2>
      <p class="text-sm text-slate-400">
        EchoMem v0.0.1<br />
        A flashcard app for language learning with spaced repetition.
      </p>
    </section>
  </div>
</div>
