import { create } from "zustand";
import { entries } from "../data/entries";
import type { CauseOfDeath, TechCategory } from "../data/types";

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
    set((state) => {
      const next = new Set(state.activeCauses);
      if (next.has(cause)) {
        next.delete(cause);
      } else {
        next.add(cause);
      }
      return { activeCauses: next };
    }),

  toggleCategory: (category) =>
    set((state) => {
      const next = new Set(state.activeCategories);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return { activeCategories: next };
    }),

  clearAll: () => set({ activeCauses: new Set(), activeCategories: new Set() }),
}));

export function useFilteredEntries() {
  const { activeCauses, activeCategories } = useFilterStore();
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
