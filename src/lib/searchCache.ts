"use client";

import type { Food } from "./types";

interface Entry {
  results: Food[];
  ts: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 min
const MAX_ENTRIES = 30;

const cache = new Map<string, Entry>();

function key(q: string): string {
  return q.trim().toLowerCase();
}

export function readCache(q: string): Food[] | null {
  const k = key(q);
  const entry = cache.get(k);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    cache.delete(k);
    return null;
  }
  return entry.results;
}

export function writeCache(q: string, results: Food[]): void {
  const k = key(q);
  cache.set(k, { results, ts: Date.now() });
  if (cache.size > MAX_ENTRIES) {
    // drop oldest
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

export function clearCache(): void {
  cache.clear();
}
