# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EchoMem is a PWA flashcard application for language learning (Anki-style) built with Svelte 5 and TypeScript. It features offline-first architecture with IndexedDB storage and FSRS spaced repetition algorithm.

## Commands

```bash
npm run dev      # Development server at http://localhost:5173
npm run build    # Production build (outputs to dist/)
npm run preview  # Preview production build
npm run check    # TypeScript and Svelte type checking
npm run format   # Format code with Prettier
```

## Architecture

### Tech Stack
- **Framework**: Vite + Svelte 5 + TypeScript
- **Styling**: Tailwind CSS (dark theme, mobile-first)
- **Storage**: IndexedDB via Dexie.js
- **Routing**: svelte-spa-router (hash-based SPA)
- **PWA**: vite-plugin-pwa with Workbox

### Key Directories

```
src/lib/
├── types/          # TypeScript interfaces (Card, Deck, Settings, SRSData)
├── db/             # Dexie.js database schema and initialization
├── stores/         # Svelte stores (decks, cards, settings)
├── services/
│   ├── srs/        # FSRS spaced repetition algorithm
│   ├── translation/# Translation providers (DeepL, LibreTranslate, mock)
│   └── llm/        # LLM providers (OpenAI, Anthropic, Ollama, mock)
├── components/     # Reusable UI components
└── utils/          # Helper functions
src/pages/          # Route pages (Home, DeckView, Study, Translate, Generate, Settings)
```

### Provider Pattern

Translation and LLM services use a provider pattern with generic interfaces:
- `TranslationProvider` interface in `services/translation/types.ts`
- `LLMProvider` interface in `services/llm/types.ts`
- Factory functions `getTranslationProvider()` and `getLLMProvider()` select implementations
- Mock providers available for development without API keys

### Data Flow

1. **Stores** (`$lib/stores/`) wrap Dexie database operations with reactive Svelte stores
2. **Database** (`$lib/db/database.ts`) defines IndexedDB schema with Dexie
3. **SRS** (`$lib/services/srs/fsrs.ts`) calculates next review dates using FSRS algorithm
4. **Pages** consume stores and render UI components

### SRS Algorithm

The FSRS (Free Spaced Repetition Scheduler) implementation in `fsrs.ts`:
- Card states: `new`, `learning`, `review`, `relearning`
- Rating options: `again`, `hard`, `good`, `easy`
- Calculates stability, difficulty, and next due date

### Routes

Hash-based routing via svelte-spa-router:
- `/` - Deck list
- `/deck/:id` - Deck details with stats
- `/deck/:id/cards` - Card list
- `/deck/:id/card/new` - Create card
- `/deck/:id/card/:cardId` - Edit card
- `/deck/:id/study` - Study session
- `/translate` - Translation with card creation
- `/generate` - LLM-based card generation
- `/settings` - App configuration

## Conventions

- Use `$lib/` alias for imports from `src/lib/`
- Components use Svelte 5 runes syntax
- All user-facing text is in English
- Conventional commits format for git history
