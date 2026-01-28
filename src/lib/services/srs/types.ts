import type { Card, Rating, SRSData } from '$lib/types/card';

export interface SRSProvider {
  name: string;

  calculateNextReview(card: Card, rating: Rating): SRSData;

  getDueCards(cards: Card[], limit?: number): Card[];

  getNewCards(cards: Card[], limit?: number): Card[];

  getReviewCards(cards: Card[], limit?: number): Card[];

  getNextReviewDate(srsData: SRSData): Date;

  getRetentionEstimate(srsData: SRSData): number;
}

export interface ReviewResult {
  card: Card;
  rating: Rating;
  previousSRSData: SRSData;
  newSRSData: SRSData;
  reviewedAt: Date;
}
