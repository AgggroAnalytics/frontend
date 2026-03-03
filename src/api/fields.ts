import type { Field, CreateFieldPayload } from '@/types';
import client from './client';

export function getFields(orgId: string): Promise<Field[]> {
  return client.get<Field[]>(`/orgs/${orgId}/fields`).then((r) => r.data);
}

export function getField(orgId: string, fieldId: string): Promise<Field> {
  return client.get<Field>(`/orgs/${orgId}/fields/${fieldId}`).then((r) => r.data);
}

export function createField(orgId: string, payload: CreateFieldPayload): Promise<Field> {
  return client.post<Field>(`/orgs/${orgId}/fields`, payload).then((r) => r.data);
}

export function updateField(
  orgId: string,
  fieldId: string,
  payload: Partial<CreateFieldPayload>,
): Promise<Field> {
  return client.patch<Field>(`/orgs/${orgId}/fields/${fieldId}`, payload).then((r) => r.data);
}

export function deleteField(orgId: string, fieldId: string): Promise<void> {
  return client.delete(`/orgs/${orgId}/fields/${fieldId}`).then(() => undefined);
}
