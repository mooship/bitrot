import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CAUSES_OF_DEATH,
  type CauseOfDeath,
  TECH_CATEGORIES,
  type TechCategory,
} from "../data/types";
import { type SortOrder, useFilterStore } from "../stores/useFilterStore";

const VALID_CAUSES = new Set<string>(CAUSES_OF_DEATH);
const VALID_CATEGORIES = new Set<string>(TECH_CATEGORIES);
const VALID_SORTS = new Set<SortOrder>(["died", "lifespan", "name"]);
const DEFAULT_SORT: SortOrder = "died";

const PARAM_QUERY = "q";
const PARAM_CAUSE = "cause";
const PARAM_CATEGORY = "category";
const PARAM_SORT = "sort";

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
  return DEFAULT_SORT;
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
  if (state.sortOrder !== DEFAULT_SORT) {
    next.set(PARAM_SORT, state.sortOrder);
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

    useFilterStore.setState({
      searchQuery: searchParams.get(PARAM_QUERY) ?? "",
      activeCauses: parseCsv<CauseOfDeath>(searchParams.get(PARAM_CAUSE), VALID_CAUSES),
      activeCategories: parseCsv<TechCategory>(searchParams.get(PARAM_CATEGORY), VALID_CATEGORIES),
      sortOrder: parseSortOrder(searchParams.get(PARAM_SORT)),
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
