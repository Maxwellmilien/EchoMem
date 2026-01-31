import type { Card, Rating, SRSData, StudyDirection } from '$lib/types/card';

export interface SRSProvider {
  name: string;

  calculateNextReview(card: Card, rating: Rating, direction?: StudyDirection): SRSData;

  getDueCards(cards: Card[], direction?: StudyDirection, limit?: number): Card[];

  getNewCards(cards: Card[], direction?: StudyDirection, limit?: number): Card[];

  getReviewCards(cards: Card[], direction?: StudyDirection, limit?: number): Card[];

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
