import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Season } from '@/types';
import * as seasonsApi from '@/api/seasons';

export const useSeasonStore = defineStore('season', () => {
  const current = ref<Season | null>(null);
  const previous = ref<Season | null>(null);
  const all = ref<Season[]>([]);

  async function loadSeasons() {
    const [currentSeason, previousSeason, allSeasons] = await Promise.all([
      seasonsApi.getCurrent().catch(() => null),
      seasonsApi.getPrevious().catch(() => null),
      seasonsApi.listSeasons(),
    ]);
    current.value = currentSeason;
    previous.value = previousSeason;
    all.value = allSeasons;
  }

  return {
    current,
    previous,
    all,
    loadSeasons,
  };
});
