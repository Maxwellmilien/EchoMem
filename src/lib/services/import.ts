import { db } from '$lib/db';
import type { ExportData, ExportCard } from '$lib/types/export';
import type { Card, SRSData } from '$lib/types/card';
import type { Deck } from '$lib/types/deck';

function deserializeSRSData(data: Record<string, unknown>): SRSData {
  return {
    due: new Date(data.due as string),
    stability: data.stability as number,
    difficulty: data.difficulty as number,
    reps: data.reps as number,
    lapses: data.lapses as number,
    state: data.state as 'new' | 'learning' | 'review' | 'relearning',
    lastReview: data.lastReview ? new Date(data.lastReview as string) : undefined
  };
}

function deserializeCard(deckId: number, cardData: Record<string, unknown>): Omit<Card, 'id'> {
  const forwardData = cardData.forwardSrsData as Record<string, unknown>;
  const reverseData = cardData.reverseSrsData as Record<string, unknown>;

  return {
    deckId,
    front: cardData.front as string,
    back: cardData.back as string,
    createdAt: new Date(cardData.createdAt as string),
    updatedAt: new Date(cardData.updatedAt as string),
    forwardSrsData: deserializeSRSData(forwardData),
    reverseSrsData: deserializeSRSData(reverseData)
  };
}

export interface ImportResult {
  settingsImported: boolean;
  decksImported: number;
  cardsImported: number;
  errors: string[];
}

export async function importData(exportData: ExportData): Promise<ImportResult> {
  const result: ImportResult = {
    settingsImported: false,
    decksImported: 0,
    cardsImported: 0,
    errors: []
  };

  try {
    // Import settings if present
    if (exportData.settings) {
      try {
        const existingSettings = await db.settings.get(1);
        if (existingSettings) {
          await db.settings.update(1, {
            translationProvider: exportData.settings.translationProvider,
            translationApiKey: exportData.settings.translationApiKey,
            llmProvider: exportData.settings.llmProvider,
            llmApiKey: exportData.settings.llmApiKey,
            llmModel: exportData.settings.llmModel,
            dictionaryProvider: exportData.settings.dictionaryProvider,
            dictionaryApiKey: exportData.settings.dictionaryApiKey,
            dailyNewCards: exportData.settings.dailyNewCards,
            dailyReviewCards: exportData.settings.dailyReviewCards,
            theme: exportData.settings.theme
          });
        }
        result.settingsImported = true;
      } catch (error) {
        result.errors.push(`Failed to import settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import decks if present
    if (exportData.decks && exportData.decks.length > 0) {
      for (const deckData of exportData.decks) {
        try {
          // Create deck
          const deck: Omit<Deck, 'id'> = {
            name: deckData.deck.name,
            description: deckData.deck.description,
            sourceLang: deckData.deck.sourceLang,
            targetLang: deckData.deck.targetLang,
            createdAt: new Date(deckData.deck.createdAt),
            updatedAt: new Date(deckData.deck.updatedAt),
            cardCount: 0,
            reverseMode: deckData.deck.reverseMode
          };

          const deckId: number = (await db.decks.add(deck as Deck)) as number;

          // Import cards for this deck
          if (deckData.cards && deckData.cards.length > 0) {
            const cards = deckData.cards.map((cardData: ExportCard) =>
              deserializeCard(deckId, cardData as unknown as Record<string, unknown>)
            );

            const cardIds = await db.cards.bulkAdd(cards as Card[], { allKeys: true });
            result.cardsImported += cardIds.length;
          }

          // Update card count
          const cardCount = await db.cards.where('deckId').equals(deckId).count();
          await db.decks.update(deckId, { cardCount });

          result.decksImported++;
        } catch (error) {
          result.errors.push(`Failed to import deck "${deckData.deck.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
