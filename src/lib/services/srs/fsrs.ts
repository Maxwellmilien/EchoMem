import type { Card, Rating, SRSData, CardState, StudyDirection } from '$lib/types/card';
import type { SRSProvider } from './types';

const FSRS_PARAMS = {
  w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
  requestRetention: 0.9,
  maximumInterval: 36500,
  easyBonus: 1.3,
  hardInterval: 1.2
};

const RATING_MAP: Record<Rating, number> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateInitialDifficulty(rating: Rating): number {
  const g = RATING_MAP[rating];
  const w = FSRS_PARAMS.w;
  return clamp(w[4] - (g - 3) * w[5], 1, 10);
}

function calculateInitialStability(rating: Rating): number {
  const g = RATING_MAP[rating];
  const w = FSRS_PARAMS.w;
  return Math.max(w[g - 1], 0.1);
}

function calculateNextDifficulty(d: number, rating: Rating): number {
  const g = RATING_MAP[rating];
  const w = FSRS_PARAMS.w;
  const newD = d - w[6] * (g - 3);
  return clamp(w[7] * (w[4] - d) + newD, 1, 10);
}

function calculateRecallStability(d: number, s: number, r: number, rating: Rating): number {
  const w = FSRS_PARAMS.w;

  let modifier = 1;
  if (rating === 'hard') {
    modifier = w[15];
  } else if (rating === 'easy') {
    modifier = w[16];
  }

  return s * (1 + Math.exp(w[8]) * (11 - d) * Math.pow(s, -w[9]) * (Math.exp((1 - r) * w[10]) - 1) * modifier);
}

function calculateForgetStability(d: number, s: number, r: number): number {
  const w = FSRS_PARAMS.w;
  return w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]);
}

function calculateInterval(s: number): number {
  const interval = (s / FSRS_PARAMS.w[0]) * (Math.pow(FSRS_PARAMS.requestRetention, 1 / FSRS_PARAMS.w[0]) - 1);
  return Math.min(Math.round(Math.max(interval, 1)), FSRS_PARAMS.maximumInterval);
}

function calculateRetrievability(s: number, elapsedDays: number): number {
  return Math.pow(1 + elapsedDays / (9 * s), -1);
}

function getNextState(currentState: CardState, rating: Rating): CardState {
  if (rating === 'again') {
    return currentState === 'new' ? 'learning' : 'relearning';
  }

  switch (currentState) {
    case 'new':
    case 'learning':
      return rating === 'easy' ? 'review' : 'learning';
    case 'review':
      return 'review';
    case 'relearning':
      return rating === 'good' || rating === 'easy' ? 'review' : 'relearning';
    default:
      return 'learning';
  }
}

export class FSRSProvider implements SRSProvider {
  name = 'FSRS';

  calculateNextReview(card: Card, rating: Rating, direction: StudyDirection = 'forward'): SRSData {
    const now = new Date();
    const srs = direction === 'forward' ? card.forwardSrsData : card.reverseSrsData;

    let newStability: number;
    let newDifficulty: number;
    let newReps = srs.reps;
    let newLapses = srs.lapses;

    if (srs.state === 'new') {
      newDifficulty = calculateInitialDifficulty(rating);
      newStability = calculateInitialStability(rating);
      newReps = 1;

      if (rating === 'again') {
        newLapses = 1;
      }
    } else {
      const elapsedDays = srs.lastReview
        ? (now.getTime() - srs.lastReview.getTime()) / (1000 * 60 * 60 * 24)
        : 0;
      const retrievability = calculateRetrievability(srs.stability, elapsedDays);

      newDifficulty = calculateNextDifficulty(srs.difficulty, rating);

      if (rating === 'again') {
        newStability = calculateForgetStability(srs.difficulty, srs.stability, retrievability);
        newLapses = srs.lapses + 1;
      } else {
        newStability = calculateRecallStability(srs.difficulty, srs.stability, retrievability, rating);
      }

      newReps = srs.reps + 1;
    }

    const newState = getNextState(srs.state, rating);

    let intervalMinutes: number;
    if (newState === 'learning' || newState === 'relearning') {
      switch (rating) {
        case 'again':
          intervalMinutes = 1;
          break;
        case 'hard':
          intervalMinutes = 6;
          break;
        case 'good':
          intervalMinutes = 10;
          break;
        case 'easy':
          intervalMinutes = 60 * 24;
          break;
        default:
          intervalMinutes = 10;
      }
    } else {
      const intervalDays = calculateInterval(newStability);
      intervalMinutes = intervalDays * 24 * 60;
    }

    const dueDate = new Date(now.getTime() + intervalMinutes * 60 * 1000);

    return {
      due: dueDate,
      stability: newStability,
      difficulty: newDifficulty,
      reps: newReps,
      lapses: newLapses,
      state: newState,
      lastReview: now
    };
  }

  getDueCards(cards: Card[], direction: StudyDirection = 'forward', limit?: number): Card[] {
    const now = new Date();
    const dueCards = cards
      .filter((card) => {
        const srs = direction === 'forward' ? card.forwardSrsData : card.reverseSrsData;
        return new Date(srs.due) <= now;
      })
      .sort((a, b) => {
        const aSrs = direction === 'forward' ? a.forwardSrsData : a.reverseSrsData;
        const bSrs = direction === 'forward' ? b.forwardSrsData : b.reverseSrsData;
        return new Date(aSrs.due).getTime() - new Date(bSrs.due).getTime();
      });

    return limit ? dueCards.slice(0, limit) : dueCards;
  }

  getNewCards(cards: Card[], direction: StudyDirection = 'forward', limit?: number): Card[] {
    const newCards = cards
      .filter((card) => {
        const srs = direction === 'forward' ? card.forwardSrsData : card.reverseSrsData;
        return srs.state === 'new';
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return limit ? newCards.slice(0, limit) : newCards;
  }

  getReviewCards(cards: Card[], direction: StudyDirection = 'forward', limit?: number): Card[] {
    const now = new Date();
    const reviewCards = cards
      .filter((card) => {
        const srs = direction === 'forward' ? card.forwardSrsData : card.reverseSrsData;
        return srs.state === 'review' && new Date(srs.due) <= now;
      })
      .sort((a, b) => {
        const aSrs = direction === 'forward' ? a.forwardSrsData : a.reverseSrsData;
        const bSrs = direction === 'forward' ? b.forwardSrsData : b.reverseSrsData;
        return new Date(aSrs.due).getTime() - new Date(bSrs.due).getTime();
      });

    return limit ? reviewCards.slice(0, limit) : reviewCards;
  }

  getNextReviewDate(srsData: SRSData): Date {
    return new Date(srsData.due);
  }

  getRetentionEstimate(srsData: SRSData): number {
    if (srsData.state === 'new') {
      return 0;
    }

    const now = new Date();
    const elapsedDays = srsData.lastReview
      ? (now.getTime() - new Date(srsData.lastReview).getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    return calculateRetrievability(srsData.stability, elapsedDays);
  }
}

export const fsrs = new FSRSProvider();
