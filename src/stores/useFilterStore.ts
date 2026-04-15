import { create } from "zustand";
import { entries } from "../data/entries";
import type { CauseOfDeath, TechCategory } from "../data/types";

function toggleInSet<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set);
  if (next.has(item)) {
    next.delete(item);
  } else {
    next.add(item);
  }
  return next;
}

interface FilterStore {
  activeCauses: Set<CauseOfDeath>;
  activeCategories: Set<TechCategory>;
  toggleCause: (cause: CauseOfDeath) => void;
  toggleCategory: (category: TechCategory) => void;
  clearAll: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  activeCauses: new Set(),
  activeCategories: new Set(),

  toggleCause: (cause) =>
    set((state) => ({ activeCauses: toggleInSet(state.activeCauses, cause) })),

  toggleCategory: (category) =>
    set((state) => ({ activeCategories: toggleInSet(state.activeCategories, category) })),

  clearAll: () => set({ activeCauses: new Set(), activeCategories: new Set() }),
}));

export function useFilteredEntries() {
  const activeCauses = useFilterStore((s) => s.activeCauses);
  const activeCategories = useFilterStore((s) => s.activeCategories);
  return entries.filter((entry) => {
    if (activeCauses.size > 0 && !activeCauses.has(entry.causeOfDeath)) {
      return false;
    }
    if (activeCategories.size > 0 && !activeCategories.has(entry.category)) {
      return false;
    }
    return true;
  });
}
