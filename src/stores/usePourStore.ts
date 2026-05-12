import { create } from "zustand";
import { fetchAllPours, incrementPour } from "../api/pours";
import type { PourCounts } from "../data/types";
import { readSessionSet, writeSessionSet } from "../utils/sessionStorage";
import { useToastStore } from "./useToastStore";

const SESSION_KEY = "poured";

interface PourStore {
  counts: PourCounts;
  globalCount: number;
  pouredThisSession: Set<string>;
  pendingPours: Set<string>;
  loading: boolean;
  fetchPours: () => Promise<void>;
  pour: (id: string) => Promise<void>;
}

export const usePourStore = create<PourStore>((set, get) => ({
  counts: {},
  globalCount: 0,
  pouredThisSession: readSessionSet(SESSION_KEY),
  pendingPours: new Set<string>(),
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

    const nextPending = new Set(state.pendingPours);
    nextPending.add(id);

    set({
      counts: nextCounts,
      globalCount: prevGlobalCount + 1,
      pouredThisSession: nextSession,
      pendingPours: nextPending,
    });

    try {
      const newCount = await incrementPour(id);
      set((s) => {
        const updatedCounts = { ...s.counts, [id]: newCount };
        const updatedPending = new Set(s.pendingPours);
        updatedPending.delete(id);
        return {
          counts: updatedCounts,
          globalCount: Object.values(updatedCounts).reduce((sum, n) => sum + n, 0),
          pendingPours: updatedPending,
        };
      });
    } catch {
      const snap = get();
      const rollback = { ...snap.counts, [id]: prev };
      const rolledBackPending = new Set(snap.pendingPours);
      rolledBackPending.delete(id);
      prevSession.delete(id);
      writeSessionSet(SESSION_KEY, prevSession);
      set({
        counts: rollback,
        globalCount: prevGlobalCount,
        pouredThisSession: prevSession,
        pendingPours: rolledBackPending,
      });
      useToastStore.getState().show("Couldn't pour — please try again.");
    }
  },
}));
