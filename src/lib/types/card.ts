export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export interface SRSData {
  due: Date;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: CardState;
  lastReview?: Date;
}

export interface Card {
  id?: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
  srsData: SRSData;
  syncId?: string;
  syncStatus?: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
}

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export function createNewSRSData(): SRSData {
  return {
    due: new Date(),
    stability: 0,
    difficulty: 0,
    reps: 0,
    lapses: 0,
    state: 'new'
  };
}

export function createCard(deckId: number, front: string, back: string): Omit<Card, 'id'> {
  const now = new Date();
  return {
    deckId,
    front,
    back,
    createdAt: now,
    updatedAt: now,
    srsData: createNewSRSData()
  };
}
