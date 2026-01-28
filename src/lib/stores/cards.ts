import { writable, derived } from 'svelte/store';
import { db } from '$lib/db';
import type { Card, Rating } from '$lib/types/card';
import { createCard } from '$lib/types/card';
import { fsrs } from '$lib/services/srs';
import { decks } from './decks';

function createCardsStore() {
  const { subscribe, set, update } = writable<Card[]>([]);

  return {
    subscribe,

    async loadForDeck(deckId: number) {
      const cards = await db.cards.where('deckId').equals(deckId).toArray();
      set(cards);
      return cards;
    },

    async add(deckId: number, front: string, back: string) {
      const card = createCard(deckId, front, back);
      const id = await db.cards.add(card as Card);
      const newCard = { ...card, id } as Card;
      update((cards) => [...cards, newCard]);
      await decks.updateCardCount(deckId);
      return newCard;
    },

    async addBatch(deckId: number, cardData: Array<{ front: string; back: string }>) {
      const now = new Date();
      const cards = cardData.map(({ front, back }) => ({
        ...createCard(deckId, front, back),
        createdAt: now,
        updatedAt: now
      }));

      const ids = await db.cards.bulkAdd(cards as Card[], { allKeys: true });
      const newCards = cards.map((card, i) => ({ ...card, id: ids[i] })) as Card[];
      update((existing) => [...existing, ...newCards]);
      await decks.updateCardCount(deckId);
      return newCards;
    },

    async update(id: number, updates: Partial<Card>) {
      const updatedAt = new Date();
      await db.cards.update(id, { ...updates, updatedAt });
      update((cards) =>
        cards.map((c) => (c.id === id ? { ...c, ...updates, updatedAt } : c))
      );
    },

    async delete(id: number, deckId: number) {
      await db.cards.delete(id);
      update((cards) => cards.filter((c) => c.id !== id));
      await decks.updateCardCount(deckId);
    },

    async get(id: number) {
      return db.cards.get(id);
    },

    async review(card: Card, rating: Rating) {
      const newSRSData = fsrs.calculateNextReview(card, rating);
      const updatedAt = new Date();

      await db.cards.update(card.id!, { srsData: newSRSData, updatedAt });
      update((cards) =>
        cards.map((c) => (c.id === card.id ? { ...c, srsData: newSRSData, updatedAt } : c))
      );

      return newSRSData;
    },

    async getDueCards(deckId: number, limit?: number) {
      const allCards = await db.cards.where('deckId').equals(deckId).toArray();
      return fsrs.getDueCards(allCards, limit);
    },

    async getStudyQueue(deckId: number, newLimit: number, reviewLimit: number) {
      const allCards = await db.cards.where('deckId').equals(deckId).toArray();
      const newCards = fsrs.getNewCards(allCards, newLimit);
      const dueCards = fsrs.getDueCards(
        allCards.filter((c) => c.srsData.state !== 'new'),
        reviewLimit
      );

      const combined = [...newCards, ...dueCards];
      return combined.sort(() => Math.random() - 0.5);
    },

    async getStats(deckId: number) {
      const allCards = await db.cards.where('deckId').equals(deckId).toArray();
      const now = new Date();

      return {
        total: allCards.length,
        new: allCards.filter((c) => c.srsData.state === 'new').length,
        learning: allCards.filter(
          (c) => c.srsData.state === 'learning' || c.srsData.state === 'relearning'
        ).length,
        review: allCards.filter((c) => c.srsData.state === 'review').length,
        due: allCards.filter((c) => new Date(c.srsData.due) <= now).length
      };
    }
  };
}

export const cards = createCardsStore();

export const cardStats = derived(cards, ($cards) => {
  const now = new Date();
  return {
    total: $cards.length,
    new: $cards.filter((c) => c.srsData.state === 'new').length,
    learning: $cards.filter(
      (c) => c.srsData.state === 'learning' || c.srsData.state === 'relearning'
    ).length,
    review: $cards.filter((c) => c.srsData.state === 'review').length,
    due: $cards.filter((c) => new Date(c.srsData.due) <= now).length
  };
});
