import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CAUSES_OF_DEATH,
  type CauseOfDeath,
  TECH_CATEGORIES,
  type TechCategory,
} from "../data/types";
import {
  DEFAULT_SORT_DIRECTION,
  DEFAULT_SORT_ORDER,
  MAX_ENTRY_YEAR,
  MIN_ENTRY_YEAR,
  SORT_DIRECTIONS,
  SORT_ORDERS,
  type SortDirection,
  type SortOrder,
  useFilterStore,
} from "../stores/useFilterStore";

const VALID_CAUSES = new Set<string>(CAUSES_OF_DEATH);
const VALID_CATEGORIES = new Set<string>(TECH_CATEGORIES);
const VALID_SORTS = new Set<SortOrder>(SORT_ORDERS);
const VALID_DIRECTIONS = new Set<SortDirection>(SORT_DIRECTIONS);

const PARAM_QUERY = "q";
const PARAM_CAUSE = "cause";
const PARAM_CATEGORY = "category";
const PARAM_SORT = "sort";
const PARAM_DIR = "dir";
const PARAM_FROM = "from";
const PARAM_TO = "to";

function parseCsv<T extends string>(raw: string | null, valid: Set<string>): Set<T> {
  const result = new Set<T>();
  if (!raw) {
    return result;
  }
  for (const item of raw.split(",")) {
    const trimmed = item.trim();
    if (trimmed && valid.has(trimmed)) {
      result.add(trimmed as T);
    }
  }
  return result;
}

function parseSortOrder(raw: string | null): SortOrder {
  if (raw && VALID_SORTS.has(raw as SortOrder)) {
    return raw as SortOrder;
  }
  return DEFAULT_SORT_ORDER;
}

function parseSortDirection(raw: string | null, order: SortOrder): SortDirection {
  if (raw && VALID_DIRECTIONS.has(raw as SortDirection)) {
    return raw as SortDirection;
  }
  return DEFAULT_SORT_DIRECTION[order];
}

function parseYear(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  if (parsed < MIN_ENTRY_YEAR || parsed > MAX_ENTRY_YEAR) {
    return null;
  }
  return parsed;
}

function buildSearchString(state: ReturnType<typeof useFilterStore.getState>): string {
  const next = new URLSearchParams();
  const trimmed = state.searchQuery.trim();
  if (trimmed) {
    next.set(PARAM_QUERY, trimmed);
  }
  if (state.activeCauses.size > 0) {
    next.set(PARAM_CAUSE, [...state.activeCauses].join(","));
  }
  if (state.activeCategories.size > 0) {
    next.set(PARAM_CATEGORY, [...state.activeCategories].join(","));
  }
  if (state.sortOrder !== DEFAULT_SORT_ORDER) {
    next.set(PARAM_SORT, state.sortOrder);
  }
  if (state.sortDirection !== DEFAULT_SORT_DIRECTION[state.sortOrder]) {
    next.set(PARAM_DIR, state.sortDirection);
  }
  if (state.fromYear != null) {
    next.set(PARAM_FROM, String(state.fromYear));
  }
  if (state.toYear != null) {
    next.set(PARAM_TO, String(state.toYear));
  }
  return next.toString();
}

export function useFilterUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lastSyncedString = useRef<string | null>(null);

  useEffect(() => {
    const incoming = searchParams.toString();
    if (incoming === lastSyncedString.current) {
      return;
    }
    lastSyncedString.current = incoming;

    const sortOrder = parseSortOrder(searchParams.get(PARAM_SORT));
    useFilterStore.setState({
      searchQuery: searchParams.get(PARAM_QUERY) ?? "",
      activeCauses: parseCsv<CauseOfDeath>(searchParams.get(PARAM_CAUSE), VALID_CAUSES),
      activeCategories: parseCsv<TechCategory>(searchParams.get(PARAM_CATEGORY), VALID_CATEGORIES),
      sortOrder,
      sortDirection: parseSortDirection(searchParams.get(PARAM_DIR), sortOrder),
      fromYear: parseYear(searchParams.get(PARAM_FROM)),
      toYear: parseYear(searchParams.get(PARAM_TO)),
    });
  }, [searchParams]);

  useEffect(() => {
    return useFilterStore.subscribe((state) => {
      const nextStr = buildSearchString(state);
      if (nextStr === lastSyncedString.current) {
        return;
      }
      lastSyncedString.current = nextStr;
      setSearchParams(nextStr, { replace: true });
    });
  }, [setSearchParams]);
}
