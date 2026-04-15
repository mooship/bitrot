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
  searchQuery: string;
  toggleCause: (cause: CauseOfDeath) => void;
  toggleCategory: (category: TechCategory) => void;
  setSearchQuery: (query: string) => void;
  clearAll: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  activeCauses: new Set(),
  activeCategories: new Set(),
  searchQuery: "",

  toggleCause: (cause) =>
    set((state) => ({ activeCauses: toggleInSet(state.activeCauses, cause) })),

  toggleCategory: (category) =>
    set((state) => ({ activeCategories: toggleInSet(state.activeCategories, category) })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  clearAll: () => set({ activeCauses: new Set(), activeCategories: new Set(), searchQuery: "" }),
}));

function entryMatchesQuery(entry: (typeof entries)[number], query: string): boolean {
  const haystack = [
    entry.name,
    entry.tagline,
    entry.autopsy,
    entry.killedBy ?? "",
    entry.parent ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function useFilteredEntries() {
  const activeCauses = useFilterStore((s) => s.activeCauses);
  const activeCategories = useFilterStore((s) => s.activeCategories);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return entries.filter((entry) => {
    if (activeCauses.size > 0 && !activeCauses.has(entry.causeOfDeath)) {
      return false;
    }
    if (activeCategories.size > 0 && !activeCategories.has(entry.category)) {
      return false;
    }
    if (normalizedQuery && !entryMatchesQuery(entry, normalizedQuery)) {
      return false;
    }
    return true;
  });
}
