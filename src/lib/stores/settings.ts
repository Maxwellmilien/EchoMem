import { writable } from 'svelte/store';
import { db } from '$lib/db';
import type { Settings } from '$lib/types/settings';
import { createDefaultSettings } from '$lib/types/settings';

function createSettingsStore() {
  const { subscribe, set, update } = writable<Settings>(createDefaultSettings());

  return {
    subscribe,

    async load() {
      let settings = await db.settings.get(1);
      if (!settings) {
        settings = createDefaultSettings();
        await db.settings.add(settings);
      }
      set(settings);
      return settings;
    },

    async update(updates: Partial<Settings>) {
      await db.settings.update(1, updates);
      update((s) => ({ ...s, ...updates }));
    },

    async reset() {
      const defaults = createDefaultSettings();
      await db.settings.put(defaults);
      set(defaults);
    }
  };
}

export const settings = createSettingsStore();
