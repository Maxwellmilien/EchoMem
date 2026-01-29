# Architecture

## Vue d'ensemble

EchoMem est une PWA de flashcards pour l'apprentissage de langues (style Anki). L'application fonctionne entièrement hors-ligne grâce à IndexedDB et utilise l'algorithme FSRS pour la répétition espacée.

### Stack technique

| Couche        | Technologie                          |
| ------------- | ------------------------------------ |
| Framework     | Vite 6 + Svelte 5 + TypeScript      |
| Styling       | Tailwind CSS 3 (dark, mobile-first)  |
| Stockage      | IndexedDB via Dexie.js 4             |
| Routage       | svelte-spa-router (hash-based)       |
| PWA           | vite-plugin-pwa + Workbox            |

## Structure des fichiers

```
src/
├── main.ts                  # Point d'entrée, mount Svelte
├── App.svelte               # Router + NavBar layout
├── app.css                  # Styles globaux Tailwind
├── lib/
│   ├── types/               # Modèles de données
│   │   ├── card.ts          # Card, SRSData, CardState, Rating
│   │   ├── deck.ts          # Deck, LANGUAGES
│   │   └── settings.ts      # Settings, createDefaultSettings()
│   ├── db/
│   │   └── database.ts      # Schema Dexie, initialisation IndexedDB
│   ├── stores/              # Stores Svelte réactifs
│   │   ├── decks.ts         # CRUD decks + deckCount dérivé
│   │   ├── cards.ts         # CRUD cards, review, study queue + cardStats dérivé
│   │   └── settings.ts      # Load/update/reset settings
│   ├── services/
│   │   ├── srs/
│   │   │   └── fsrs.ts      # Algorithme FSRS (stabilité, difficulté, intervalles)
│   │   ├── translation/     # Provider pattern : DeepL, LibreTranslate, mock
│   │   ├── llm/             # Provider pattern : OpenAI, Anthropic, Ollama, mock
│   │   └── dictionary/      # Provider pattern : Free Dictionary, Wiktionary, mock
│   ├── components/          # Composants UI réutilisables
│   └── utils/
│       └── date.ts          # formatDate, formatRelativeTime, isDue
└── pages/                   # Pages liées aux routes
    ├── Home.svelte          # Liste des decks
    ├── DeckView.svelte      # Détail deck + stats
    ├── CardList.svelte      # Liste des cartes d'un deck
    ├── CardNew.svelte       # Création de carte
    ├── CardEdit.svelte      # Édition de carte
    ├── Study.svelte         # Session d'étude
    ├── Translate.svelte     # Traduction + lookup dictionnaire
    ├── Generate.svelte      # Génération de cartes via LLM
    └── Settings.svelte      # Configuration
```

## Modèles de données

### Card

```typescript
interface Card {
  id?: number
  deckId: number
  front: string
  back: string
  createdAt: Date
  updatedAt: Date
  srsData: SRSData
  // Champs prêts pour la sync future
  syncId?: string
  syncStatus?: 'synced' | 'pending' | 'conflict'
  lastSyncedAt?: Date
}

interface SRSData {
  due: Date
  stability: number      // Stabilité mémoire (jours)
  difficulty: number     // 0-10
  reps: number
  lapses: number
  state: CardState       // 'new' | 'learning' | 'review' | 'relearning'
  lastReview?: Date
}

type Rating = 'again' | 'hard' | 'good' | 'easy'
```

### Deck

```typescript
interface Deck {
  id?: number
  name: string
  description: string
  sourceLang: string     // Code ISO (27 langues supportées)
  targetLang: string
  createdAt: Date
  updatedAt: Date
  cardCount: number
  syncId?: string
  syncStatus?: 'synced' | 'pending' | 'conflict'
  lastSyncedAt?: Date
}
```

### Settings

```typescript
interface Settings {
  id: number             // Toujours 1 (singleton)
  translationProvider: string
  translationApiKey?: string
  llmProvider: string
  llmApiKey?: string
  llmModel?: string
  dictionaryProvider: string
  dictionaryApiKey?: string
  dailyNewCards: number       // Défaut: 20
  dailyReviewCards: number    // Défaut: 100
  theme: 'dark' | 'light' | 'system'
}
```

## Base de données (IndexedDB via Dexie)

**Tables et index :**

| Table      | Index                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| `cards`    | `++id`, `deckId`, `[deckId+srsData.due]`, `srsData.state`, `srsData.due`, `syncId` |
| `decks`    | `++id`, `name`, `syncId`                                                 |
| `settings` | `++id`                                                                   |

L'index composé `[deckId+srsData.due]` permet de récupérer efficacement les cartes dues pour un deck donné.

L'initialisation (`initializeDatabase()`) crée les settings par défaut au premier lancement.

## Architecture en couches

```
┌─────────────────────────────────────────┐
│              Pages (routes)             │  Logique métier, orchestration
├─────────────────────────────────────────┤
│           Stores (réactifs)             │  État applicatif, accès DB
├────────────┬────────────┬───────────────┤
│    SRS     │ Translation│  LLM / Dict   │  Services (logique domaine)
├────────────┴────────────┴───────────────┤
│           Components (UI)               │  Éléments réutilisables
├─────────────────────────────────────────┤
│         Database (Dexie/IndexedDB)      │  Persistance
├─────────────────────────────────────────┤
│            Types (interfaces)           │  Contrats partagés
└─────────────────────────────────────────┘
```

## Provider Pattern (services)

Les trois services externes (translation, LLM, dictionary) suivent le même pattern :

```
types.ts      →  Interface du provider + types d'erreur
mock.ts       →  Implémentation de démo (pas d'API)
*.ts          →  Implémentations concrètes (DeepL, OpenAI, Wiktionary...)
provider.ts   →  Factory getXxxProvider() + configureXxxProvider()
index.ts      →  Ré-export public
```

**Interface commune :**
- `name: string` — Nom du provider
- `requiresApiKey: boolean` — Indique si une clé API est nécessaire
- `isConfigured(): boolean` — Vérification de configuration
- Méthode principale : `translate()`, `generate()`, ou `lookup()`

### Providers disponibles

| Service       | Providers                              |
| ------------- | -------------------------------------- |
| Translation   | Mock, DeepL, LibreTranslate            |
| LLM           | Mock, OpenAI, Anthropic, Ollama        |
| Dictionary    | Mock, Free Dictionary API, Wiktionary  |

## Algorithme FSRS

Implémentation dans `src/lib/services/srs/fsrs.ts`.

**Transitions d'état :**

```
new ──→ learning ──→ review ←──→ relearning
         ↑                          │
         └──────────────────────────┘
```

**Intervalles d'apprentissage (état learning/new) :**
- again → 1 min
- hard → 6 min
- good → 10 min
- easy → 1 jour

**Intervalles de révision (état review) :** calculés via la formule de stabilité FSRS avec 17 poids optimisés. Rétention cible : 90%.

**API du store :**
- `cards.getStudyQueue(deckId, newLimit, reviewLimit)` — File d'attente mélangée (nouvelles + dues)
- `cards.review(card, rating)` — Applique FSRS et persiste le résultat

## Routes

| Route                     | Page            | Description                    |
| ------------------------- | --------------- | ------------------------------ |
| `/`                       | Home            | Liste des decks                |
| `/deck/:id`               | DeckView        | Détail + stats du deck         |
| `/deck/:id/cards`         | CardList        | Toutes les cartes du deck      |
| `/deck/:id/card/new`      | CardNew         | Créer une carte                |
| `/deck/:id/card/:cardId`  | CardEdit        | Éditer une carte               |
| `/deck/:id/study`         | Study           | Session d'étude                |
| `/translate`              | Translate       | Traduction + dictionnaire      |
| `/generate`               | Generate        | Génération de cartes par LLM   |
| `/settings`               | Settings        | Configuration                  |

## Composants UI

| Composant        | Rôle                                              |
| ---------------- | ------------------------------------------------- |
| NavBar           | Navigation fixe en bas (4 sections)               |
| DeckCard         | Carte de deck dans la liste (nom, langues, stats)  |
| DeckForm         | Formulaire création/édition de deck               |
| CardForm         | Formulaire création/édition de carte              |
| CardItem         | Aperçu d'une carte (front/back, état coloré)       |
| StudyCard        | Carte plein écran pour la révision                |
| RatingButtons    | 4 boutons de notation (again/hard/good/easy, 1-4) |
| ProgressBar      | Progression de la session d'étude                 |
| BackButton       | Bouton retour avec href configurable              |
| EmptyState       | Placeholder pour listes vides                     |
| Modal            | Overlay modal (Escape/backdrop pour fermer)       |

## Flux de données principaux

### Session d'étude

```
Study.svelte
  → settings.load()         — Limites quotidiennes
  → cards.getStudyQueue()   — File new + due, mélangée
  → StudyCard (affichage)
  → RatingButtons (input)
  → cards.review(card, rating)
    → fsrs.calculateNextReview()
    → Dexie update card.srsData
  → cardStats mis à jour réactivement
```

### Traduction + création de carte

```
Translate.svelte
  → getTranslationProvider()  — Factory depuis settings
  → provider.translate()      — Appel API ou mock
  → Si mot unique : getDictionaryProvider().lookup()
  → Affichage résultat + définitions
  → Modal "Add to Deck"
  → cards.add(deckId, front, back)
```

### Génération LLM

```
Generate.svelte
  → getLLMProvider()          — Factory depuis settings
  → provider.generate()      — Prompt structuré → JSON
  → Sélection des cartes générées
  → cards.addBatch(deckId, selectedCards)
```

## Points d'extension

- **Sync cloud** : Les champs `syncId`, `syncStatus`, `lastSyncedAt` sont déjà présents sur Card et Deck
- **Thèmes** : Le settings supporte `'light'` et `'system'` en plus de `'dark'`
- **Nouveaux providers** : Ajouter un fichier d'implémentation + l'enregistrer dans la factory
- **Export/Import** : La structure de données se prête à la sérialisation JSON
- **FSRS configurable** : Les 17 poids et la rétention cible pourraient être exposés dans les settings
