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

export type SortOrder = "died" | "lifespan" | "name";

export const SORT_ORDERS: readonly SortOrder[] = ["died", "lifespan", "name"];
export const DEFAULT_SORT_ORDER: SortOrder = "died";

interface FilterStore {
  activeCauses: Set<CauseOfDeath>;
  activeCategories: Set<TechCategory>;
  searchQuery: string;
  sortOrder: SortOrder;
  toggleCause: (cause: CauseOfDeath) => void;
  toggleCategory: (category: TechCategory) => void;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: SortOrder) => void;
  clearAll: () => void;
}

export function hasActiveFilters(state: {
  activeCauses: Set<CauseOfDeath>;
  activeCategories: Set<TechCategory>;
  searchQuery: string;
}): boolean {
  return (
    state.activeCauses.size > 0 ||
    state.activeCategories.size > 0 ||
    state.searchQuery.trim().length > 0
  );
}

export const useFilterStore = create<FilterStore>((set) => ({
  activeCauses: new Set(),
  activeCategories: new Set(),
  searchQuery: "",
  sortOrder: DEFAULT_SORT_ORDER,

  toggleCause: (cause) =>
    set((state) => ({ activeCauses: toggleInSet(state.activeCauses, cause) })),

  toggleCategory: (category) =>
    set((state) => ({ activeCategories: toggleInSet(state.activeCategories, category) })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortOrder: (order) => set({ sortOrder: order }),

  clearAll: () =>
    set({
      activeCauses: new Set(),
      activeCategories: new Set(),
      searchQuery: "",
      sortOrder: DEFAULT_SORT_ORDER,
    }),
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
  const sortOrder = useFilterStore((s) => s.sortOrder);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = entries.filter((entry) => {
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

  if (sortOrder === "lifespan") {
    return [...filtered].sort((a, b) => a.died - a.born - (b.died - b.born));
  }
  if (sortOrder === "name") {
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }
  return filtered;
}
