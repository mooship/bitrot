import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CAUSES_OF_DEATH,
  type CauseOfDeath,
  TECH_CATEGORIES,
  type TechCategory,
} from "../data/types";
import { useFilterStore } from "../stores/useFilterStore";

const VALID_CAUSES = new Set<string>(CAUSES_OF_DEATH);
const VALID_CATEGORIES = new Set<string>(TECH_CATEGORIES);

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

function buildSearchString(state: ReturnType<typeof useFilterStore.getState>): string {
  const next = new URLSearchParams();
  const trimmed = state.searchQuery.trim();
  if (trimmed) {
    next.set("q", trimmed);
  }
  if (state.activeCauses.size > 0) {
    next.set("cause", [...state.activeCauses].join(","));
  }
  if (state.activeCategories.size > 0) {
    next.set("category", [...state.activeCategories].join(","));
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
      searchQuery: searchParams.get("q") ?? "",
      activeCauses: parseCsv<CauseOfDeath>(searchParams.get("cause"), VALID_CAUSES),
      activeCategories: parseCsv<TechCategory>(searchParams.get("category"), VALID_CATEGORIES),
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
