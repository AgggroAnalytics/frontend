import type { Organization, OrgMember, OrgRole } from '@/types';
import client from './client';

export function getOrgs(): Promise<Organization[]> {
  return client.get<Organization[]>('/orgs').then((r) => r.data);
}

export function getMembers(orgId: string): Promise<OrgMember[]> {
  return client.get<OrgMember[]>(`/orgs/${orgId}/members`).then((r) => r.data);
}

export function addMember(
  orgId: string,
  payload: { user_id: string; role: OrgRole },
): Promise<OrgMember> {
  return client.post<OrgMember>(`/orgs/${orgId}/members`, payload).then((r) => r.data);
}

export function updateMemberRole(orgId: string, userId: string, role: OrgRole): Promise<OrgMember> {
  return client
    .patch<OrgMember>(`/orgs/${orgId}/members/${userId}`, { role })
    .then((r) => r.data);
}

export function removeMember(orgId: string, userId: string): Promise<void> {
  return client.delete(`/orgs/${orgId}/members/${userId}`).then(() => undefined);
}
