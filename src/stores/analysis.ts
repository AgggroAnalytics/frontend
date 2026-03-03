import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AnalysisRequest, CreateAnalysisPayload } from '@/types';
import * as analysisApi from '@/api/analysis';

export const useAnalysisStore = defineStore('analysis', () => {
  const analyses = ref<AnalysisRequest[]>([]);
  const currentAnalysis = ref<AnalysisRequest | null>(null);
  const isLoading = ref(false);

  async function loadAnalyses(orgId: string, fieldId: string, seasonId?: string) {
    isLoading.value = true;
    try {
      analyses.value = await analysisApi.listAnalyses(orgId, fieldId, {
        season_id: seasonId,
      });
    } finally {
      isLoading.value = false;
    }
  }

  async function loadAnalysis(orgId: string, fieldId: string, analysisId: string) {
    isLoading.value = true;
    try {
      currentAnalysis.value = await analysisApi.getAnalysis(orgId, fieldId, analysisId);
    } finally {
      isLoading.value = false;
    }
  }

  async function createAnalysis(orgId: string, fieldId: string, payload: CreateAnalysisPayload) {
    const analysis = await analysisApi.createAnalysis(orgId, fieldId, payload);
    analyses.value.unshift(analysis);
    return analysis;
  }

  return {
    analyses,
    currentAnalysis,
    isLoading,
    loadAnalyses,
    loadAnalysis,
    createAnalysis,
  };
});
