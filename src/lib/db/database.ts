import Dexie, { type EntityTable } from 'dexie';
import type { Card } from '$lib/types/card';
import { createNewSRSData } from '$lib/types/card';
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

    this.version(2)
      .stores({
        cards: '++id, deckId, [deckId+forwardSrsData.due], [deckId+reverseSrsData.due], forwardSrsData.state, reverseSrsData.state, forwardSrsData.due, reverseSrsData.due, syncId',
        decks: '++id, name, reverseMode, syncId',
        settings: '++id'
      })
      .upgrade(async (trans) => {
        // Migrate existing cards to dual SRS structure
        const cards = await trans.table('cards').toArray();
        for (const card of cards) {
          if (!card.forwardSrsData && card.srsData) {
            // Copy srsData to forwardSrsData (preserve existing progress)
            const forwardSrsData = { ...card.srsData };
            // Create new reverseSrsData
            const reverseSrsData = createNewSRSData();

            await trans.table('cards').update(card.id, {
              forwardSrsData,
              reverseSrsData
            });
          }
        }

        // Migrate decks to include reverseMode
        const decks = await trans.table('decks').toArray();
        for (const deck of decks) {
          if (deck.reverseMode === undefined) {
            await trans.table('decks').update(deck.id, {
              reverseMode: false
            });
          }
        }
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
