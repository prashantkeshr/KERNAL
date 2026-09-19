import Fuse, { type IFuseOptions } from 'fuse.js';
import { SearchEntry, buildSearchIndex } from './content-engine';

let fuse: Fuse<SearchEntry> | null = null;

const FUSE_OPTIONS: IFuseOptions<SearchEntry> = {
  keys: [
    { name: 'title',    weight: 0.6 },
    { name: 'subtitle', weight: 0.3 },
    { name: 'tags',     weight: 0.2 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
};

export async function initSearch(): Promise<void> {
  const entries = await buildSearchIndex();
  fuse = new Fuse(entries, FUSE_OPTIONS);
}

export function search(query: string): SearchEntry[] {
  if (!fuse || !query.trim()) return [];
  return fuse.search(query).map(r => r.item);
}

export function isReady(): boolean {
  return fuse !== null;
}
