import type { DeadTech } from "../data/types";

const MS_PER_DAY = 86_400_000;

function utcEpochDay(date: Date): number {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY
  );
}

export function getDailyEntry(pool: readonly DeadTech[], date: Date = new Date()): DeadTech | null {
  if (pool.length === 0) {
    return null;
  }
  const stable = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  const index = ((utcEpochDay(date) % stable.length) + stable.length) % stable.length;
  return stable[index];
}
