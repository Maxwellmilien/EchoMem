<script lang="ts">
  import { onMount } from 'svelte';
  import { settings, decks } from '$lib/stores';
  import { Modal, SelectableItem } from '$lib/components';
  import type { Deck } from '$lib/types/deck';
  import { exportData } from '$lib/services/export';
  import { downloadJSON, generateExportFilename } from '$lib/utils/export';
  import { importData as importDataService } from '$lib/services/import';
  import { readExportFile } from '$lib/utils/import';

  let dailyNewCards = 20;
  let dailyReviewCards = 100;
  let translationProvider = 'mock';
  let translationApiKey = '';
  let llmProvider = 'mock';
  let llmApiKey = '';
  let llmModel = '';
  let dictionaryProvider = 'mock';
  let dictionaryApiKey = '';

  let showExportModal = false;
  let includeSettings = false;
  let includeApiKeys = false;
  let selectedDeckIds: Set<number> = new Set();
  let allDecks: Deck[] = [];
  let exporting = false;
  let exportError: string | null = null;

  let showImportModal = false;
  let importFile: File | null = null;
  let importing = false;
  let importError: string | null = null;
  let importSuccess: string | null = null;

  onMount(async () => {
    const s = await settings.load();
    dailyNewCards = s.dailyNewCards;
    dailyReviewCards = s.dailyReviewCards;
    translationProvider = s.translationProvider;
    translationApiKey = s.translationApiKey ?? '';
    llmProvider = s.llmProvider;
    llmApiKey = s.llmApiKey ?? '';
    llmModel = s.llmModel ?? '';
    dictionaryProvider = s.dictionaryProvider;
    dictionaryApiKey = s.dictionaryApiKey ?? '';
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

  async function saveDictionarySettings() {
    await settings.update({
      dictionaryProvider,
      dictionaryApiKey: dictionaryApiKey || undefined
    });
  }

  $: totalCards = allDecks
    .filter(d => selectedDeckIds.has(d.id!))
    .reduce((sum, d) => sum + d.cardCount, 0);
  $: hasSelection = selectedDeckIds.size > 0 || includeSettings;

  async function openExportModal() {
    allDecks = await decks.load();
    selectedDeckIds = new Set(allDecks.map(d => d.id!));
    includeSettings = false;
    includeApiKeys = false;
    exportError = null;
    showExportModal = true;
  }

  function toggleDeck(deckId: number) {
    if (selectedDeckIds.has(deckId)) {
      selectedDeckIds.delete(deckId);
    } else {
      selectedDeckIds.add(deckId);
    }
    selectedDeckIds = selectedDeckIds;
  }

  function selectAllDecks() {
    selectedDeckIds = new Set(allDecks.map(d => d.id!));
  }

  function deselectAllDecks() {
    selectedDeckIds = new Set();
  }

  async function handleExport() {
    if (!hasSelection) {
      exportError = 'Please select at least one item to export';
      return;
    }

    exporting = true;
    exportError = null;

    try {
      const data = await exportData(includeSettings, includeApiKeys, selectedDeckIds);
      const filename = generateExportFilename();
      downloadJSON(data, filename);
      showExportModal = false;
    } catch (error) {
      exportError = error instanceof Error ? error.message : 'Export failed';
    } finally {
      exporting = false;
    }
  }

  function openImportModal() {
    importFile = null;
    importError = null;
    importSuccess = null;
    showImportModal = true;
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    importFile = input.files?.[0] || null;
    importError = null;
  }

  async function handleImport() {
    if (!importFile) {
      importError = 'Please select a file to import';
      return;
    }

    importing = true;
    importError = null;
    importSuccess = null;

    try {
      const exportedData = await readExportFile(importFile);
      const result = await importDataService(exportedData);

      if (result.errors.length > 0) {
        importError = result.errors.join('; ');
      }

      const summary = [];
      if (result.settingsImported) summary.push('Settings');
      if (result.decksImported > 0) summary.push(`${result.decksImported} deck(s)`);
      if (result.cardsImported > 0) summary.push(`${result.cardsImported} card(s)`);

      if (summary.length > 0) {
        importSuccess = `Successfully imported: ${summary.join(', ')}`;
        // Reload settings and decks to reflect changes
        await settings.load();
        await decks.load();
      } else if (result.errors.length === 0) {
        importError = 'No data to import';
      }

      if (result.errors.length === 0) {
        setTimeout(() => {
          showImportModal = false;
        }, 1500);
      }
    } catch (error) {
      importError = error instanceof Error ? error.message : 'Import failed';
    } finally {
      importing = false;
    }
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
            <option value="google">Google Translate</option>
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
      <h2 class="text-lg font-semibold text-slate-100 mb-4">Dictionary API</h2>

      <div class="space-y-4">
        <div>
          <label for="dictProvider" class="label">Provider</label>
          <select
            id="dictProvider"
            bind:value={dictionaryProvider}
            on:change={saveDictionarySettings}
            class="input"
          >
            <option value="mock">Mock (Demo)</option>
            <option value="free-dictionary">Free Dictionary API</option>
            <option value="wiktionary">Wiktionary</option>
          </select>
        </div>

        {#if dictionaryProvider !== 'mock' && dictionaryProvider !== 'free-dictionary' && dictionaryProvider !== 'wiktionary'}
          <div>
            <label for="dictApiKey" class="label">API Key</label>
            <input
              type="password"
              id="dictApiKey"
              bind:value={dictionaryApiKey}
              on:change={saveDictionarySettings}
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
            <option value="mistral">Mistral</option>
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
              placeholder={llmProvider === 'openai' ? 'gpt-4o-mini' : llmProvider === 'anthropic' ? 'claude-3-haiku-20240307' : llmProvider === 'mistral' ? 'mistral-small-latest' : 'llama2'}
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

    <section class="card">
      <h2 class="text-lg font-semibold text-slate-100 mb-4">Data Management</h2>
      <div class="space-y-2">
        <button class="btn-primary w-full" on:click={openExportModal}>
          Export Data
        </button>
        <button class="btn-secondary w-full" on:click={openImportModal}>
          Import Data
        </button>
      </div>
    </section>
  </div>
</div>

<Modal bind:open={showExportModal} title="Export Data" on:close={() => showExportModal = false}>
  <div class="space-y-4">
    {#if includeSettings && includeApiKeys}
      <div class="bg-yellow-900/30 border border-yellow-600 rounded p-3 text-sm text-yellow-200">
        ⚠️ Warning: This export will include API keys. Keep this file secure.
      </div>
    {/if}

    <p class="text-slate-300 text-sm">Select items to export:</p>

    <div class="flex gap-2">
      <button class="btn-ghost text-xs" on:click={selectAllDecks}>Select All</button>
      <button class="btn-ghost text-xs" on:click={deselectAllDecks}>Deselect All</button>
    </div>

    <div class="space-y-3">
      <SelectableItem
        bind:selected={includeSettings}
        label="Settings"
        description="Preferences, translation provider, and LLM settings"
      />

      {#if includeSettings}
        <div class="ml-2 pt-2">
          <SelectableItem
            bind:selected={includeApiKeys}
            label="Include API Keys"
            description="Warning: This will include sensitive API credentials"
          />
        </div>
      {/if}

      {#if allDecks.length > 0}
        <div class="border-t border-slate-700 pt-4">
          <p class="text-sm text-slate-400 mb-3 font-medium">Decks to Export:</p>
          <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
            {#each allDecks as deck (deck.id)}
              <SelectableItem
                selected={selectedDeckIds.has(deck.id!)}
                on:toggle={() => toggleDeck(deck.id!)}
                label={deck.name}
                description={`${deck.cardCount} card${deck.cardCount !== 1 ? 's' : ''}`}
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>

    {#if hasSelection}
      <p class="text-sm text-slate-400">
        Total: {selectedDeckIds.size} deck{selectedDeckIds.size !== 1 ? 's' : ''}, {totalCards} card{totalCards !== 1 ? 's' : ''}
      </p>
    {/if}

    {#if exportError}
      <p class="text-sm text-red-400">{exportError}</p>
    {/if}

    <div class="flex gap-3">
      <button class="btn-secondary flex-1" on:click={() => showExportModal = false}>
        Cancel
      </button>
      <button
        class="btn-primary flex-1"
        on:click={handleExport}
        disabled={!hasSelection || exporting}
      >
        {exporting ? 'Exporting...' : `Export Selected`}
      </button>
    </div>
  </div>
</Modal>

<Modal bind:open={showImportModal} title="Import Data" on:close={() => showImportModal = false}>
  <div class="space-y-4">
    <p class="text-slate-300 text-sm">Select a JSON export file to import:</p>

    <div>
      <label for="importFile" class="label">Choose File</label>
      <input
        id="importFile"
        type="file"
        accept=".json"
        on:change={handleFileSelect}
        class="input"
      />
    </div>

    {#if importFile}
      <p class="text-sm text-slate-400">
        Selected: <span class="text-slate-200 font-medium">{importFile.name}</span>
      </p>
    {/if}

    {#if importError}
      <div class="bg-red-900/30 border border-red-700 rounded p-3 text-sm text-red-300">
        {importError}
      </div>
    {/if}

    {#if importSuccess}
      <div class="bg-green-900/30 border border-green-700 rounded p-3 text-sm text-green-300">
        ✓ {importSuccess}
      </div>
    {/if}

    <div class="flex gap-3">
      <button class="btn-secondary flex-1" on:click={() => showImportModal = false}>
        Cancel
      </button>
      <button
        class="btn-primary flex-1"
        on:click={handleImport}
        disabled={!importFile || importing}
      >
        {importing ? 'Importing...' : 'Import'}
      </button>
    </div>
  </div>
</Modal>
