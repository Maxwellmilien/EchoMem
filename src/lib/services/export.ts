import { db } from '$lib/db';
import type { ExportData, ExportCard, ExportSRSData } from '$lib/types/export';
import type { SRSData } from '$lib/types/card';
import type { Card } from '$lib/types/card';
import type { Settings } from '$lib/types/settings';

function serializeSRSData(srsData: SRSData): ExportSRSData {
  return {
    due: srsData.due.toISOString(),
    stability: srsData.stability,
    difficulty: srsData.difficulty,
    reps: srsData.reps,
    lapses: srsData.lapses,
    state: srsData.state,
    lastReview: srsData.lastReview?.toISOString()
  };
}

function serializeCard(card: Card): ExportCard {
  return {
    front: card.front,
    back: card.back,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
    forwardSrsData: serializeSRSData(card.forwardSrsData),
    reverseSrsData: serializeSRSData(card.reverseSrsData)
  };
}

export async function exportData(
  includeSettings: boolean,
  includeApiKeys: boolean,
  selectedDeckIds: Set<number>
): Promise<ExportData> {
  const exportResult: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString()
  };

  // Export settings if requested
  if (includeSettings) {
    const appSettings: Settings | undefined = await db.settings.get(1);
    if (appSettings) {
      const exportedSettings = {
        translationProvider: appSettings.translationProvider,
        llmProvider: appSettings.llmProvider,
        dictionaryProvider: appSettings.dictionaryProvider,
        dailyNewCards: appSettings.dailyNewCards,
        dailyReviewCards: appSettings.dailyReviewCards,
        theme: appSettings.theme
      };

      // Include API keys if requested
      if (includeApiKeys) {
        if (appSettings.translationApiKey) {
          (exportedSettings as Record<string, unknown>).translationApiKey = appSettings.translationApiKey;
        }
        if (appSettings.llmApiKey) {
          (exportedSettings as Record<string, unknown>).llmApiKey = appSettings.llmApiKey;
        }
        if (appSettings.dictionaryApiKey) {
          (exportedSettings as Record<string, unknown>).dictionaryApiKey = appSettings.dictionaryApiKey;
        }
      }

      if (appSettings.llmModel) {
        (exportedSettings as Record<string, unknown>).llmModel = appSettings.llmModel;
      }

      exportResult.settings = exportedSettings;
    }
  }

  // Export selected decks with their cards
  if (selectedDeckIds.size > 0) {
    const exportedDecks = [];

    for (const deckId of selectedDeckIds) {
      const deck = await db.decks.get(deckId);
      if (!deck) continue;

      const cardsForDeck = await db.cards.where('deckId').equals(deckId).toArray();

      exportedDecks.push({
        deck: {
          name: deck.name,
          description: deck.description,
          sourceLang: deck.sourceLang,
          targetLang: deck.targetLang,
          createdAt: deck.createdAt.toISOString(),
          updatedAt: deck.updatedAt.toISOString(),
          cardCount: deck.cardCount,
          reverseMode: deck.reverseMode
        },
        cards: cardsForDeck.map(serializeCard)
      });
    }

    exportResult.decks = exportedDecks;
  }

  return exportResult;
}
