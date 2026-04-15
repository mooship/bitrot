import { create } from "zustand";

interface Toast {
  id: number;
  message: string;
}

interface ToastStore {
  toast: Toast | null;
  show: (message: string) => void;
  dismiss: () => void;
}

let nextId = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,

  show: (message) => {
    const id = ++nextId;
    set({ toast: { id, message } });
    setTimeout(() => {
      set((s) => (s.toast?.id === id ? { toast: null } : {}));
    }, 4000);
  },

  dismiss: () => set({ toast: null }),
}));
