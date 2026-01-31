import type { ExportData } from '$lib/types/export';

export async function readExportFile(file: File): Promise<ExportData> {
  if (!file.name.endsWith('.json')) {
    throw new Error('File must be a JSON file');
  }

  const text = await file.text();
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }

  // Validate structure
  validateExportData(data);

  return data as ExportData;
}

function validateExportData(data: unknown): void {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Export file must contain a JSON object');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') {
    throw new Error('Invalid export file: missing or invalid "version" field');
  }

  if (typeof obj.exportedAt !== 'string') {
    throw new Error('Invalid export file: missing or invalid "exportedAt" field');
  }

  // Validate settings if present
  if (obj.settings !== undefined && obj.settings !== null) {
    if (typeof obj.settings !== 'object') {
      throw new Error('Invalid export file: "settings" must be an object');
    }

    const settings = obj.settings as Record<string, unknown>;
    if (typeof settings.translationProvider !== 'string') {
      throw new Error('Invalid export file: settings.translationProvider must be a string');
    }
    if (typeof settings.llmProvider !== 'string') {
      throw new Error('Invalid export file: settings.llmProvider must be a string');
    }
    if (typeof settings.dictionaryProvider !== 'string') {
      throw new Error('Invalid export file: settings.dictionaryProvider must be a string');
    }
  }

  // Validate decks if present
  if (obj.decks !== undefined && obj.decks !== null) {
    if (!Array.isArray(obj.decks)) {
      throw new Error('Invalid export file: "decks" must be an array');
    }

    for (const deckItem of obj.decks) {
      if (typeof deckItem !== 'object' || deckItem === null) {
        throw new Error('Invalid export file: each deck must be an object');
      }

      const deck = deckItem as Record<string, unknown>;

      if (typeof deck.deck !== 'object' || deck.deck === null) {
        throw new Error('Invalid export file: each deck must have a "deck" object');
      }

      const deckObj = deck.deck as Record<string, unknown>;
      if (typeof deckObj.name !== 'string') {
        throw new Error('Invalid export file: deck.name must be a string');
      }

      if (!Array.isArray(deck.cards)) {
        throw new Error('Invalid export file: each deck must have a "cards" array');
      }

      for (const card of deck.cards) {
        if (typeof card !== 'object' || card === null) {
          throw new Error('Invalid export file: each card must be an object');
        }

        const cardObj = card as Record<string, unknown>;
        if (typeof cardObj.front !== 'string' || typeof cardObj.back !== 'string') {
          throw new Error('Invalid export file: each card must have "front" and "back" fields');
        }
      }
    }
  }
}
