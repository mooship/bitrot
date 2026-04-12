import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

export const useThemeStore = create<ThemeStore>((set) => {
  const initial = getInitialTheme();
  applyTheme(initial);

  return {
    theme: initial,
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        return { theme: next };
      }),
    setTheme: (theme) =>
      set(() => {
        applyTheme(theme);
        return { theme };
      }),
  };
});
