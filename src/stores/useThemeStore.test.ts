import { mockMatchMedia } from "../test/setup";

describe("useThemeStore", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.dataset.theme = "";
    mockMatchMedia(() => false);
  });

  async function importStore() {
    const mod = await import("./useThemeStore");
    return mod.useThemeStore;
  }

  it("defaults to dark when no localStorage and system prefers dark", async () => {
    const useThemeStore = await importStore();
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("reads theme from localStorage when available", async () => {
    localStorage.setItem("theme", "light");

    const useThemeStore = await importStore();
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("uses system light preference when no localStorage", async () => {
    mockMatchMedia((query) => query === "(prefers-color-scheme: light)");

    const useThemeStore = await importStore();
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("applies theme to document element on init", async () => {
    const useThemeStore = await importStore();
    expect(document.documentElement.dataset.theme).toBe(useThemeStore.getState().theme);
  });

  it("toggleTheme switches from dark to light", async () => {
    const useThemeStore = await importStore();
    expect(useThemeStore.getState().theme).toBe("dark");

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("toggleTheme switches back from light to dark", async () => {
    const useThemeStore = await importStore();
    useThemeStore.getState().toggleTheme();
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("toggleTheme updates document.documentElement.dataset.theme", async () => {
    const useThemeStore = await importStore();
    useThemeStore.getState().toggleTheme();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("toggleTheme persists to localStorage", async () => {
    const useThemeStore = await importStore();
    useThemeStore.getState().toggleTheme();
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("setTheme explicitly sets the theme", async () => {
    const useThemeStore = await importStore();
    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
