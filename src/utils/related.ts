import type { DeadTech } from "../data/types";

const SAME_CAUSE_WEIGHT = 3;
const SAME_CATEGORY_WEIGHT = 2;
const OVERLAP_WEIGHT = 1;

function lifespansOverlap(a: DeadTech, b: DeadTech): boolean {
  return a.born <= b.died && b.born <= a.died;
}

function score(target: DeadTech, candidate: DeadTech): number {
  let total = 0;
  if (target.causeOfDeath === candidate.causeOfDeath) {
    total += SAME_CAUSE_WEIGHT;
  }
  if (target.category === candidate.category) {
    total += SAME_CATEGORY_WEIGHT;
  }
  if (lifespansOverlap(target, candidate)) {
    total += OVERLAP_WEIGHT;
  }
  return total;
}

export function getRelatedEntries(
  target: DeadTech,
  pool: readonly DeadTech[],
  limit = 3
): DeadTech[] {
  return pool
    .filter((entry) => entry.id !== target.id)
    .map((entry) => ({ entry, score: score(target, entry) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}
