import type { DeadTech } from "../data/types";

const MS_PER_DAY = 86_400_000;

function utcEpochDay(date: Date): number {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY
  );
}

const sortedCache = new WeakMap<readonly DeadTech[], readonly DeadTech[]>();

function stableSorted(pool: readonly DeadTech[]): readonly DeadTech[] {
  const cached = sortedCache.get(pool);
  if (cached) {
    return cached;
  }
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  sortedCache.set(pool, sorted);
  return sorted;
}

export function getDailyEntry(pool: readonly DeadTech[], date: Date = new Date()): DeadTech | null {
  if (pool.length === 0) {
    return null;
  }
  const stable = stableSorted(pool);
  const index = ((utcEpochDay(date) % stable.length) + stable.length) % stable.length;
  return stable[index];
}
