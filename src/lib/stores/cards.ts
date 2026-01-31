import { writable, derived } from 'svelte/store';
import { db } from '$lib/db';
import type { Card, Rating, StudyDirection } from '$lib/types/card';
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

    async review(card: Card, rating: Rating, direction: StudyDirection = 'forward') {
      const newSRSData = fsrs.calculateNextReview(card, rating, direction);
      const updatedAt = new Date();

      // Update the correct SRS data based on direction
      const srsUpdate = direction === 'forward'
        ? { forwardSrsData: newSRSData }
        : { reverseSrsData: newSRSData };

      await db.cards.update(card.id!, { ...srsUpdate, updatedAt });
      update((cards) =>
        cards.map((c) => (c.id === card.id ? { ...c, ...srsUpdate, updatedAt } : c))
      );

      return newSRSData;
    },

    async getDueCards(deckId: number, direction: StudyDirection = 'forward', limit?: number) {
      const allCards = await db.cards.where('deckId').equals(deckId).toArray();
      return fsrs.getDueCards(allCards, direction, limit);
    },

    async getStudyQueue(deckId: number, newLimit: number, reviewLimit: number, direction: StudyDirection = 'forward') {
      const allCards = await db.cards.where('deckId').equals(deckId).toArray();
      const newCards = fsrs.getNewCards(allCards, direction, newLimit);
      const dueCards = fsrs.getDueCards(
        allCards.filter((c) => {
          const srsData = direction === 'forward' ? c.forwardSrsData : c.reverseSrsData;
          return srsData.state !== 'new';
        }),
        direction,
        reviewLimit
      );

      const combined = [...newCards, ...dueCards];
      return combined.sort(() => Math.random() - 0.5);
    },

    async getStats(deckId: number, direction: StudyDirection = 'forward') {
      const allCards = await db.cards.where('deckId').equals(deckId).toArray();
      const now = new Date();

      return {
        total: allCards.length,
        new: allCards.filter((c) => {
          const srsData = direction === 'forward' ? c.forwardSrsData : c.reverseSrsData;
          return srsData.state === 'new';
        }).length,
        learning: allCards.filter((c) => {
          const srsData = direction === 'forward' ? c.forwardSrsData : c.reverseSrsData;
          return srsData.state === 'learning' || srsData.state === 'relearning';
        }).length,
        review: allCards.filter((c) => {
          const srsData = direction === 'forward' ? c.forwardSrsData : c.reverseSrsData;
          return srsData.state === 'review';
        }).length,
        due: allCards.filter((c) => {
          const srsData = direction === 'forward' ? c.forwardSrsData : c.reverseSrsData;
          return new Date(srsData.due) <= now;
        }).length
      };
    },

    async getDualStats(deckId: number) {
      const forwardStats = await this.getStats(deckId, 'forward');
      const reverseStats = await this.getStats(deckId, 'reverse');

      return {
        forward: forwardStats,
        reverse: reverseStats,
        total: forwardStats.total
      };
    }
  };
}

export const cards = createCardsStore();

export const cardStats = derived(cards, ($cards) => {
  const now = new Date();
  return {
    total: $cards.length,
    new: $cards.filter((c) => c.forwardSrsData.state === 'new').length,
    learning: $cards.filter(
      (c) => c.forwardSrsData.state === 'learning' || c.forwardSrsData.state === 'relearning'
    ).length,
    review: $cards.filter((c) => c.forwardSrsData.state === 'review').length,
    due: $cards.filter((c) => new Date(c.forwardSrsData.due) <= now).length
  };
});
