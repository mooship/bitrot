import { create } from "zustand";
import { fetchAllPours, incrementPour } from "../api/pours";
import type { PourCounts } from "../data/types";
import { readSessionSet, writeSessionSet } from "../utils/sessionStorage";

const SESSION_KEY = "poured";

interface PourStore {
  counts: PourCounts;
  globalCount: number;
  pouredThisSession: Set<string>;
  loading: boolean;
  fetchPours: () => Promise<void>;
  pour: (id: string) => Promise<void>;
}

export const usePourStore = create<PourStore>((set, get) => ({
  counts: {},
  globalCount: 0,
  pouredThisSession: readSessionSet(SESSION_KEY),
  loading: false,

  fetchPours: async () => {
    set({ loading: true });
    try {
      const counts = await fetchAllPours();
      const globalCount = Object.values(counts).reduce((sum, n) => sum + n, 0);
      set({ counts, globalCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  pour: async (id) => {
    const state = get();
    if (state.pouredThisSession.has(id)) {
      return;
    }

    const prev = state.counts[id] ?? 0;
    const prevGlobalCount = state.globalCount;
    const prevSession = new Set(state.pouredThisSession);
    const nextCounts = { ...state.counts, [id]: prev + 1 };
    const nextSession = new Set(state.pouredThisSession);
    nextSession.add(id);
    writeSessionSet(SESSION_KEY, nextSession);

    set({
      counts: nextCounts,
      globalCount: prevGlobalCount + 1,
      pouredThisSession: nextSession,
    });

    try {
      const newCount = await incrementPour(id);
      set((s) => ({
        counts: { ...s.counts, [id]: newCount },
      }));
    } catch {
      const rollback = { ...get().counts, [id]: prev };
      prevSession.delete(id);
      writeSessionSet(SESSION_KEY, prevSession);
      set({
        counts: rollback,
        globalCount: prevGlobalCount,
        pouredThisSession: prevSession,
      });
    }
  },
}));
