import { create } from "zustand";
import { fetchAllPours, incrementPour } from "../api/pours";

interface PourStore {
  counts: Record<string, number>;
  globalCount: number;
  pouredThisSession: Set<string>;
  loading: boolean;
  fetchPours: () => Promise<void>;
  pour: (id: string) => Promise<void>;
}

function getSessionPoured(): Set<string> {
  try {
    const raw = sessionStorage.getItem("poured");
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveSessionPoured(ids: Set<string>) {
  sessionStorage.setItem("poured", JSON.stringify([...ids]));
}

export const usePourStore = create<PourStore>((set, get) => ({
  counts: {},
  globalCount: 0,
  pouredThisSession: getSessionPoured(),
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
    saveSessionPoured(nextSession);

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
      saveSessionPoured(prevSession);
      set({
        counts: rollback,
        globalCount: prevGlobalCount,
        pouredThisSession: prevSession,
      });
    }
  },
}));
