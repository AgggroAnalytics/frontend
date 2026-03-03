import type { AnalysisRequest, CreateAnalysisPayload } from '@/types';
import client from './client';

export function createAnalysis(
  orgId: string,
  fieldId: string,
  payload: CreateAnalysisPayload,
): Promise<AnalysisRequest> {
  return client
    .post<AnalysisRequest>(`/orgs/${orgId}/fields/${fieldId}/analysis`, payload)
    .then((r) => r.data);
}

export function getAnalysis(
  orgId: string,
  fieldId: string,
  analysisId: string,
): Promise<AnalysisRequest> {
  return client
    .get<AnalysisRequest>(`/orgs/${orgId}/fields/${fieldId}/analysis/${analysisId}`)
    .then((r) => r.data);
}

export function listAnalyses(
  orgId: string,
  fieldId: string,
  params?: { season_id?: string },
): Promise<AnalysisRequest[]> {
  return client
    .get<AnalysisRequest[]>(`/orgs/${orgId}/fields/${fieldId}/analysis`, { params })
    .then((r) => r.data);
}
