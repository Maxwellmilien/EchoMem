import { writable, derived } from 'svelte/store';
import { db } from '$lib/db';
import type { Deck } from '$lib/types/deck';
import { createDeck } from '$lib/types/deck';

function createDecksStore() {
  const { subscribe, set, update } = writable<Deck[]>([]);

  return {
    subscribe,

    async load() {
      const decks = await db.decks.toArray();
      set(decks);
      return decks;
    },

    async add(name: string, description: string, sourceLang: string, targetLang: string) {
      const deck = createDeck(name, description, sourceLang, targetLang);
      const id = await db.decks.add(deck as Deck);
      const newDeck = { ...deck, id } as Deck;
      update((decks) => [...decks, newDeck]);
      return newDeck;
    },

    async update(id: number, updates: Partial<Deck>) {
      const updatedAt = new Date();
      await db.decks.update(id, { ...updates, updatedAt });
      update((decks) =>
        decks.map((d) => (d.id === id ? { ...d, ...updates, updatedAt } : d))
      );
    },

    async delete(id: number) {
      await db.transaction('rw', [db.decks, db.cards], async () => {
        await db.cards.where('deckId').equals(id).delete();
        await db.decks.delete(id);
      });
      update((decks) => decks.filter((d) => d.id !== id));
    },

    async get(id: number) {
      return db.decks.get(id);
    },

    async updateCardCount(deckId: number) {
      const count = await db.cards.where('deckId').equals(deckId).count();
      await db.decks.update(deckId, { cardCount: count, updatedAt: new Date() });
      update((decks) =>
        decks.map((d) => (d.id === deckId ? { ...d, cardCount: count } : d))
      );
    }
  };
}

export const decks = createDecksStore();

export const deckCount = derived(decks, ($decks) => $decks.length);
