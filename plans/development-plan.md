# Plan de Développement - EchoMem

PWA Flashcard pour l'apprentissage de langues (style Anki) avec Svelte/TypeScript.

---

## Suivi d'avancement global

| Phase | Description | Statut |
|-------|-------------|--------|
| 1 | Initialisation du projet | ⬜ Non commencé |
| 2 | MVP - Decks et Cartes | ⬜ Non commencé |
| 3 | Système de traduction | ⬜ Non commencé |
| 4 | Génération LLM | ⬜ Non commencé |

**Légende:** ⬜ Non commencé | 🟡 En cours | ✅ Terminé

---

## Résumé des choix techniques

| Aspect | Choix |
|--------|-------|
| Framework | SvelteKit + TypeScript |
| UI | Tailwind CSS (custom) |
| Stockage local | IndexedDB (via Dexie.js) |
| Algorithme SRS | FSRS (interface générique) |
| APIs externes | Interfaces génériques (traduction + LLM) |
| Architecture | Mobile-first, responsive, offline-first |
| Déploiement | VPS (PWA) |

---

## Phase 1 : Initialisation du projet

### Checklist

- [ ] **1.1** Setup SvelteKit + TypeScript
- [ ] **1.2** Configuration Tailwind CSS (mobile-first)
- [ ] **1.3** Configuration PWA (manifest + service worker + icônes)
- [ ] **1.4** Setup IndexedDB avec Dexie.js
- [ ] **1.5** Structure de dossiers créée
- [ ] **1.6** App fonctionnelle et installable

### Structure de dossiers cible

```
src/
├── lib/
│   ├── components/     # Composants UI réutilisables
│   ├── stores/         # Svelte stores
│   ├── db/             # IndexedDB (Dexie)
│   ├── services/       # Logique métier
│   │   ├── srs/        # Algorithmes SRS
│   │   ├── translation/# Interface traduction
│   │   └── llm/        # Interface LLM
│   ├── types/          # Types TypeScript
│   └── utils/          # Utilitaires
├── routes/             # Pages SvelteKit
└── app.css             # Styles globaux Tailwind
```

### Vérification Phase 1

- [ ] L'app se lance avec `npm run dev`
- [ ] PWA installable sur mobile
- [ ] Service worker actif
- [ ] Pas d'erreurs TypeScript

---

## Phase 2 : MVP - Gestion des Decks et Cartes

### Checklist

- [ ] **2.1** Modèles de données (Types TypeScript)
- [ ] **2.2** Base de données IndexedDB (schéma Dexie)
- [ ] **2.3** Interface SRS générique + implémentation FSRS
- [ ] **2.4** CRUD Decks (créer, lire, modifier, supprimer)
- [ ] **2.5** CRUD Cartes (créer, lire, modifier, supprimer)
- [ ] **2.6** Session d'étude (study flow)
- [ ] **2.7** Navigation et routing
- [ ] **2.8** UI responsive complète

### Modèles de données

**Card:** id, deckId, front (recto), back (verso), createdAt, updatedAt, srsData

**SRSData:** due, stability, difficulty, reps, lapses, state (new/learning/review/relearning)

**Deck:** id, name, description, sourceLang, targetLang, createdAt, updatedAt, cardCount

### Pages et routes

| Route | Description | Statut |
|-------|-------------|--------|
| `/` | Liste des decks | - [ ] |
| `/deck/new` | Créer un deck | - [ ] |
| `/deck/[id]` | Vue détaillée d'un deck | - [ ] |
| `/deck/[id]/cards` | Liste des cartes du deck | - [ ] |
| `/deck/[id]/card/new` | Ajouter une carte | - [ ] |
| `/deck/[id]/card/[cardId]` | Éditer une carte | - [ ] |
| `/deck/[id]/study` | Session d'étude | - [ ] |
| `/settings` | Paramètres | - [ ] |

### Composants UI

| Composant | Description | Statut |
|-----------|-------------|--------|
| `DeckCard.svelte` | Carte de deck dans la liste | - [ ] |
| `DeckForm.svelte` | Formulaire création/édition deck | - [ ] |
| `CardItem.svelte` | Élément carte dans liste | - [ ] |
| `CardForm.svelte` | Formulaire création/édition carte | - [ ] |
| `StudyCard.svelte` | Affichage carte pendant étude | - [ ] |
| `RatingButtons.svelte` | Boutons Again/Hard/Good/Easy | - [ ] |
| `ProgressBar.svelte` | Barre de progression session | - [ ] |
| `NavBar.svelte` | Navigation mobile bottom bar | - [ ] |

### Session d'étude (Study Flow)

1. Charger les cartes dues via `srs.getDueCards()`
2. Afficher le recto de la première carte
3. L'utilisateur clique pour révéler le verso
4. L'utilisateur note sa réponse (Again/Hard/Good/Easy)
5. Mise à jour SRS et passage à la carte suivante
6. Fin de session : afficher statistiques

### Vérification Phase 2

- [ ] CRUD deck fonctionne
- [ ] CRUD cartes fonctionne
- [ ] Session d'étude complète
- [ ] Algorithme SRS correct
- [ ] Persistance après refresh
- [ ] Mode offline fonctionnel
- [ ] UI responsive

---

## Phase 3 : Système de traduction

### Checklist

- [ ] **3.1** Interface générique TranslationProvider
- [ ] **3.2** Implémentation mock provider (dev)
- [ ] **3.3** Implémentation d'un vrai provider
- [ ] **3.4** Page de traduction `/translate`
- [ ] **3.5** Workflow traduction → création de carte
- [ ] **3.6** Configuration API keys dans settings
- [ ] **3.7** Gestion erreurs (offline, rate limit)

### Structure des providers

```
services/translation/
├── types.ts              # Interface TranslationProvider
├── provider.ts           # Factory
├── deepl.ts              # Provider DeepL
├── libretranslate.ts     # Provider LibreTranslate
└── mock.ts               # Mock pour dev/tests
```

### Workflow : Traduction → Carte

- [ ] 1. L'utilisateur entre un mot/phrase
- [ ] 2. Appel à l'API de traduction
- [ ] 3. Affichage du résultat avec alternatives
- [ ] 4. Bouton "Créer une carte"
- [ ] 5. Pré-remplissage du formulaire
- [ ] 6. Sauvegarde de la carte

### Vérification Phase 3

- [ ] Traduction affiche le résultat
- [ ] Création de carte depuis traduction
- [ ] Gestion des erreurs API
- [ ] Changement de provider fonctionne

---

## Phase 4 : Génération LLM

### Checklist

- [ ] **4.1** Interface générique LLMProvider
- [ ] **4.2** Implémentation mock provider (dev)
- [ ] **4.3** Implémentation d'un vrai provider
- [ ] **4.4** Templates de prompts
- [ ] **4.5** Page de génération `/generate`
- [ ] **4.6** Sélection des types de cartes
- [ ] **4.7** Preview des suggestions
- [ ] **4.8** Ajout multiple de cartes
- [ ] **4.9** Configuration API keys

### Structure des providers

```
services/llm/
├── types.ts              # Interface LLMProvider
├── provider.ts           # Factory
├── openai.ts             # Provider OpenAI
├── anthropic.ts          # Provider Anthropic
├── ollama.ts             # Provider Ollama (local)
└── mock.ts               # Mock pour dev/tests
```

### Types de génération supportés

| Type | Description | Statut |
|------|-------------|--------|
| `sentence` | Phrase d'exemple | - [ ] |
| `conjugation` | Conjugaison (verbes) | - [ ] |
| `declension` | Déclinaison (noms, adj) | - [ ] |
| `synonym` | Synonymes | - [ ] |
| `antonym` | Antonymes | - [ ] |
| `collocation` | Expressions courantes | - [ ] |
| `context` | Mot en contexte | - [ ] |

### Workflow : Mot → Suggestions → Cartes

- [ ] 1. L'utilisateur entre un mot
- [ ] 2. Sélection des types de cartes souhaités
- [ ] 3. Appel au LLM pour génération
- [ ] 4. Affichage des suggestions avec preview
- [ ] 5. L'utilisateur sélectionne les cartes à créer
- [ ] 6. Ajout en batch au deck

### Vérification Phase 4

- [ ] Génération de suggestions fonctionne
- [ ] Preview des cartes affichée
- [ ] Création multiple fonctionne
- [ ] Cartes dans le deck correct
- [ ] Gestion des erreurs API

---

## Préparation sync future

Les modèles Card et Deck incluront des champs pour la synchronisation :

- [ ] `syncId` : ID côté serveur
- [ ] `syncStatus` : synced / pending / conflict
- [ ] `lastSyncedAt` : Date dernière sync

---

## Fichiers critiques par phase

| Phase | Fichier | Rôle | Statut |
|-------|---------|------|--------|
| 1 | `vite.config.ts` | Config PWA | - [ ] |
| 1 | `src/lib/db/database.ts` | Schéma IndexedDB | - [ ] |
| 2 | `src/lib/types/card.ts` | Types Card/SRSData | - [ ] |
| 2 | `src/lib/types/deck.ts` | Type Deck | - [ ] |
| 2 | `src/lib/services/srs/fsrs.ts` | Algorithme FSRS | - [ ] |
| 2 | `src/routes/deck/[id]/study/+page.svelte` | Session d'étude | - [ ] |
| 3 | `src/lib/services/translation/types.ts` | Interface traduction | - [ ] |
| 4 | `src/lib/services/llm/types.ts` | Interface LLM | - [ ] |

---

## Commandes de développement

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run preview      # Preview build
npm run lint         # Vérification ESLint
npm run format       # Formatage Prettier
```
