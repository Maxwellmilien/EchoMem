import Dexie, { type EntityTable } from 'dexie';
import type { Card } from '$lib/types/card';
import type { Deck } from '$lib/types/deck';
import type { Settings } from '$lib/types/settings';
import { createDefaultSettings } from '$lib/types/settings';

export class EchoMemDatabase extends Dexie {
  cards!: EntityTable<Card, 'id'>;
  decks!: EntityTable<Deck, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor() {
    super('EchoMemDB');

    this.version(1).stores({
      cards: '++id, deckId, [deckId+srsData.due], srsData.state, srsData.due, syncId',
      decks: '++id, name, syncId',
      settings: '++id'
    });
  }
}

export const db = new EchoMemDatabase();

export async function initializeDatabase(): Promise<void> {
  const existingSettings = await db.settings.get(1);
  if (!existingSettings) {
    await db.settings.add(createDefaultSettings());
  }
}

initializeDatabase();
