import type { Season } from '@/types';
import client from './client';

export function getCurrent(): Promise<Season> {
  return client.get<Season>('/seasons/current').then((r) => r.data);
}

export function getPrevious(): Promise<Season> {
  return client.get<Season>('/seasons/previous').then((r) => r.data);
}

export function listSeasons(): Promise<Season[]> {
  return client.get<Season[]>('/seasons').then((r) => r.data);
}
