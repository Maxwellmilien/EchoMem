<script lang="ts">
  import Router from 'svelte-spa-router';
  import { NavBar } from '$lib/components';
  import {
    Home,
    DeckView,
    CardList,
    CardNew,
    CardEdit,
    Study,
    Translate,
    Generate,
    Settings
  } from './pages';

  const routes = {
    '/': Home,
    '/deck/:id': DeckView,
    '/deck/:id/cards': CardList,
    '/deck/:id/card/new': CardNew,
    '/deck/:id/card/:cardId': CardEdit,
    '/deck/:id/study': Study,
    '/translate': Translate,
    '/generate': Generate,
    '/settings': Settings
  };
</script>

<div class="min-h-full flex flex-col">
  <main class="flex-1">
    <Router {routes} />
  </main>
  <NavBar />
</div>
