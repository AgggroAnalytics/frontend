import type { Report, CreateReportPayload } from '@/types';
import client from './client';

export function createReport(
  orgId: string,
  fieldId: string,
  payload: CreateReportPayload,
): Promise<Report> {
  return client.post<Report>(`/orgs/${orgId}/fields/${fieldId}/reports`, payload).then((r) => r.data);
}

export function getReport(orgId: string, fieldId: string, reportId: string): Promise<Report> {
  return client
    .get<Report>(`/orgs/${orgId}/fields/${fieldId}/reports/${reportId}`)
    .then((r) => r.data);
}

export function listReports(orgId: string, fieldId: string): Promise<Report[]> {
  return client.get<Report[]>(`/orgs/${orgId}/fields/${fieldId}/reports`).then((r) => r.data);
}

export function downloadReport(
  orgId: string,
  fieldId: string,
  reportId: string,
): Promise<Blob> {
  return client
    .get(`/orgs/${orgId}/fields/${fieldId}/reports/${reportId}/download`, {
      responseType: 'blob',
    })
    .then((r) => r.data);
}
