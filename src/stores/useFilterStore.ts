import { create } from "zustand";
import { entries } from "../data/entries";
import type { CauseOfDeath, TechCategory } from "../data/types";
import { fuzzyMatch } from "../utils/fuzzy";

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
export type SortDirection = "asc" | "desc";

export const SORT_ORDERS: readonly SortOrder[] = ["died", "lifespan", "name"];
export const SORT_DIRECTIONS: readonly SortDirection[] = ["asc", "desc"];
export const DEFAULT_SORT_ORDER: SortOrder = "died";

export const DEFAULT_SORT_DIRECTION: Record<SortOrder, SortDirection> = {
  died: "desc",
  lifespan: "asc",
  name: "asc",
};

const YEAR_BOUNDS = entries.reduce(
  (acc, entry) => ({
    min: Math.min(acc.min, entry.born),
    max: Math.max(acc.max, entry.died),
  }),
  { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
);

export const MIN_ENTRY_YEAR = Number.isFinite(YEAR_BOUNDS.min) ? YEAR_BOUNDS.min : 1970;
export const MAX_ENTRY_YEAR = Number.isFinite(YEAR_BOUNDS.max)
  ? YEAR_BOUNDS.max
  : new Date().getFullYear();

interface FilterStore {
  activeCauses: Set<CauseOfDeath>;
  activeCategories: Set<TechCategory>;
  searchQuery: string;
  sortOrder: SortOrder;
  sortDirection: SortDirection;
  fromYear: number | null;
  toYear: number | null;
  toggleCause: (cause: CauseOfDeath) => void;
  toggleCategory: (category: TechCategory) => void;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setSortDirection: (direction: SortDirection) => void;
  toggleSortDirection: () => void;
  setYearRange: (from: number | null, to: number | null) => void;
  clearAll: () => void;
}

export function hasActiveFilters(state: {
  activeCauses: Set<CauseOfDeath>;
  activeCategories: Set<TechCategory>;
  searchQuery: string;
  fromYear?: number | null;
  toYear?: number | null;
}): boolean {
  return (
    state.activeCauses.size > 0 ||
    state.activeCategories.size > 0 ||
    state.searchQuery.trim().length > 0 ||
    state.fromYear != null ||
    state.toYear != null
  );
}

export const useFilterStore = create<FilterStore>((set) => ({
  activeCauses: new Set(),
  activeCategories: new Set(),
  searchQuery: "",
  sortOrder: DEFAULT_SORT_ORDER,
  sortDirection: DEFAULT_SORT_DIRECTION[DEFAULT_SORT_ORDER],
  fromYear: null,
  toYear: null,

  toggleCause: (cause) =>
    set((state) => ({ activeCauses: toggleInSet(state.activeCauses, cause) })),

  toggleCategory: (category) =>
    set((state) => ({ activeCategories: toggleInSet(state.activeCategories, category) })),

  setSearchQuery: (query) =>
    set((state) => (state.searchQuery === query ? state : { searchQuery: query })),

  setSortOrder: (order) =>
    set((state) => {
      if (state.sortOrder === order) {
        return state;
      }
      return { sortOrder: order, sortDirection: DEFAULT_SORT_DIRECTION[order] };
    }),

  setSortDirection: (direction) =>
    set((state) => (state.sortDirection === direction ? state : { sortDirection: direction })),

  toggleSortDirection: () =>
    set((state) => ({ sortDirection: state.sortDirection === "asc" ? "desc" : "asc" })),

  setYearRange: (from, to) =>
    set((state) =>
      state.fromYear === from && state.toYear === to ? state : { fromYear: from, toYear: to }
    ),

  clearAll: () =>
    set({
      activeCauses: new Set(),
      activeCategories: new Set(),
      searchQuery: "",
      sortOrder: DEFAULT_SORT_ORDER,
      sortDirection: DEFAULT_SORT_DIRECTION[DEFAULT_SORT_ORDER],
      fromYear: null,
      toYear: null,
    }),
}));

function entryMatchesQuery(entry: (typeof entries)[number], query: string): boolean {
  const haystack = [
    entry.name,
    entry.tagline,
    entry.autopsy,
    entry.killedBy ?? "",
    entry.parent ?? "",
  ].join(" ");
  return fuzzyMatch(query, haystack);
}

function compareBy(
  order: SortOrder,
  a: (typeof entries)[number],
  b: (typeof entries)[number]
): number {
  if (order === "lifespan") {
    return a.died - a.born - (b.died - b.born);
  }
  if (order === "name") {
    return a.name.localeCompare(b.name);
  }
  return b.died - a.died;
}

export function useFilteredEntries() {
  const activeCauses = useFilterStore((s) => s.activeCauses);
  const activeCategories = useFilterStore((s) => s.activeCategories);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const sortOrder = useFilterStore((s) => s.sortOrder);
  const sortDirection = useFilterStore((s) => s.sortDirection);
  const fromYear = useFilterStore((s) => s.fromYear);
  const toYear = useFilterStore((s) => s.toYear);

  const trimmedQuery = searchQuery.trim();
  const filtered = entries.filter((entry) => {
    if (activeCauses.size > 0 && !activeCauses.has(entry.causeOfDeath)) {
      return false;
    }
    if (activeCategories.size > 0 && !activeCategories.has(entry.category)) {
      return false;
    }
    if (fromYear != null && entry.died < fromYear) {
      return false;
    }
    if (toYear != null && entry.died > toYear) {
      return false;
    }
    if (trimmedQuery && !entryMatchesQuery(entry, trimmedQuery)) {
      return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => compareBy(sortOrder, a, b));
  if (sortDirection === DEFAULT_SORT_DIRECTION[sortOrder]) {
    return sorted;
  }
  return sorted.reverse();
}
