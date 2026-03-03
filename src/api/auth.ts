import type { UserProfile } from '@/types';
import client from './client';

export function getProfile(): Promise<UserProfile> {
  return client.get<UserProfile>('/me').then((r) => r.data);
}
