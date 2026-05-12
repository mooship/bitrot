import { entries } from "../data/entries";
import type { DeadTech } from "../data/types";

const RECENT_PICK_LIMIT = 3;
export const recentPicks: string[] = [];

export function currentEntryId(pathname: string): string | null {
  const match = pathname.match(/^\/entry\/([^/]+)/);
  return match ? match[1] : null;
}

export function pickRandomEntry(currentId: string | null): DeadTech | null {
  if (entries.length === 0) {
    return null;
  }
  const avoid = new Set(recentPicks);
  if (currentId) {
    avoid.add(currentId);
  }
  const candidates = entries.filter((e) => !avoid.has(e.id));
  const pool = candidates.length > 0 ? candidates : entries.filter((e) => e.id !== currentId);
  const source = pool.length > 0 ? pool : entries;
  const pick = source[Math.floor(Math.random() * source.length)];
  recentPicks.unshift(pick.id);
  if (recentPicks.length > RECENT_PICK_LIMIT) {
    recentPicks.length = RECENT_PICK_LIMIT;
  }
  return pick;
}
