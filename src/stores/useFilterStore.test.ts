import { renderHook } from "@testing-library/react";
import { entries } from "../data/entries";
import { resetFilterStore } from "../test/fixtures";
import { useFilteredEntries, useFilterStore } from "./useFilterStore";

beforeEach(() => {
  resetFilterStore();
});

describe("useFilterStore", () => {
  it("starts with empty filter sets", () => {
    const state = useFilterStore.getState();
    expect(state.activeCauses.size).toBe(0);
    expect(state.activeCategories.size).toBe(0);
  });

  it("toggleCause adds a cause to the set", () => {
    useFilterStore.getState().toggleCause("neglected");
    expect(useFilterStore.getState().activeCauses.has("neglected")).toBe(true);
  });

  it("toggleCause removes a cause when toggled twice", () => {
    useFilterStore.getState().toggleCause("neglected");
    useFilterStore.getState().toggleCause("neglected");
    expect(useFilterStore.getState().activeCauses.has("neglected")).toBe(false);
  });

  it("toggleCategory adds a category to the set", () => {
    useFilterStore.getState().toggleCategory("social");
    expect(useFilterStore.getState().activeCategories.has("social")).toBe(true);
  });

  it("toggleCategory removes a category when toggled twice", () => {
    useFilterStore.getState().toggleCategory("social");
    useFilterStore.getState().toggleCategory("social");
    expect(useFilterStore.getState().activeCategories.has("social")).toBe(false);
  });

  it("supports multiple active causes", () => {
    useFilterStore.getState().toggleCause("neglected");
    useFilterStore.getState().toggleCause("hubris");
    const causes = useFilterStore.getState().activeCauses;
    expect(causes.has("neglected")).toBe(true);
    expect(causes.has("hubris")).toBe(true);
    expect(causes.size).toBe(2);
  });

  it("clearAll resets both sets and search query", () => {
    useFilterStore.getState().toggleCause("neglected");
    useFilterStore.getState().toggleCategory("social");
    useFilterStore.getState().setSearchQuery("google");
    useFilterStore.getState().clearAll();
    const state = useFilterStore.getState();
    expect(state.activeCauses.size).toBe(0);
    expect(state.activeCategories.size).toBe(0);
    expect(state.searchQuery).toBe("");
  });

  it("setSearchQuery updates the query string", () => {
    useFilterStore.getState().setSearchQuery("reader");
    expect(useFilterStore.getState().searchQuery).toBe("reader");
  });
});

describe("useFilteredEntries", () => {
  it("returns all entries when no filters are active", () => {
    const { result } = renderHook(() => useFilteredEntries());
    expect(result.current.length).toBe(entries.length);
  });

  it("filters by a single cause", () => {
    useFilterStore.getState().toggleCause("neglected");
    const { result } = renderHook(() => useFilteredEntries());
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.every((e) => e.causeOfDeath === "neglected")).toBe(true);
  });

  it("filters by a single category", () => {
    useFilterStore.getState().toggleCategory("social");
    const { result } = renderHook(() => useFilteredEntries());
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.every((e) => e.category === "social")).toBe(true);
  });

  it("applies OR logic within causes (multiple causes)", () => {
    useFilterStore.getState().toggleCause("neglected");
    useFilterStore.getState().toggleCause("hubris");
    const { result } = renderHook(() => useFilteredEntries());
    expect(
      result.current.every((e) => e.causeOfDeath === "neglected" || e.causeOfDeath === "hubris")
    ).toBe(true);
  });

  it("applies AND logic between cause and category filters", () => {
    useFilterStore.getState().toggleCause("acqui-killed");
    useFilterStore.getState().toggleCategory("social");
    const { result } = renderHook(() => useFilteredEntries());
    for (const entry of result.current) {
      expect(entry.causeOfDeath).toBe("acqui-killed");
      expect(entry.category).toBe("social");
    }
  });

  it("returns empty array when no entries match", () => {
    useFilterStore.getState().toggleCause("legal");
    useFilterStore.getState().toggleCategory("os");
    const { result } = renderHook(() => useFilteredEntries());
    for (const entry of result.current) {
      expect(entry.causeOfDeath).toBe("legal");
      expect(entry.category).toBe("os");
    }
  });

  it("returns all entries after clearAll", () => {
    useFilterStore.getState().toggleCause("neglected");
    useFilterStore.getState().clearAll();
    const { result } = renderHook(() => useFilteredEntries());
    expect(result.current.length).toBe(entries.length);
  });

  it("filters by search query against entry name", () => {
    useFilterStore.getState().setSearchQuery("Google Reader");
    const { result } = renderHook(() => useFilteredEntries());
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.some((e) => e.id === "google-reader")).toBe(true);
    expect(
      result.current.every((e) =>
        /google reader/i.test(
          `${e.name} ${e.tagline} ${e.autopsy} ${e.killedBy ?? ""} ${e.parent ?? ""}`
        )
      )
    ).toBe(true);
  });

  it("search query is case-insensitive", () => {
    useFilterStore.getState().setSearchQuery("GOOGLE");
    const lower = renderHook(() => useFilteredEntries()).result.current.length;
    useFilterStore.getState().setSearchQuery("google");
    const upper = renderHook(() => useFilteredEntries()).result.current.length;
    expect(lower).toBe(upper);
    expect(lower).toBeGreaterThan(0);
  });

  it("search query matches against killedBy and parent", () => {
    useFilterStore.getState().setSearchQuery("google");
    const { result } = renderHook(() => useFilteredEntries());
    const matching = result.current.filter(
      (e) => e.parent === "Google" || (e.killedBy ?? "").includes("Google")
    );
    expect(matching.length).toBeGreaterThan(0);
  });

  it("empty/whitespace search query is ignored", () => {
    useFilterStore.getState().setSearchQuery("   ");
    const { result } = renderHook(() => useFilteredEntries());
    expect(result.current.length).toBe(entries.length);
  });

  it("search combines with cause/category filters using AND logic", () => {
    useFilterStore.getState().toggleCause("neglected");
    useFilterStore.getState().setSearchQuery("google");
    const { result } = renderHook(() => useFilteredEntries());
    for (const entry of result.current) {
      expect(entry.causeOfDeath).toBe("neglected");
    }
  });

  it("sorts by name A-Z when sortOrder is 'name'", () => {
    useFilterStore.getState().setSortOrder("name");
    const { result } = renderHook(() => useFilteredEntries());
    const names = result.current.map((e) => e.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("sorts by lifespan ascending when sortOrder is 'lifespan'", () => {
    useFilterStore.getState().setSortOrder("lifespan");
    const { result } = renderHook(() => useFilteredEntries());
    const lifespans = result.current.map((e) => e.died - e.born);
    for (let i = 1; i < lifespans.length; i++) {
      expect(lifespans[i]).toBeGreaterThanOrEqual(lifespans[i - 1]);
    }
  });

  it("clearAll does not reset sortOrder", () => {
    useFilterStore.getState().setSortOrder("name");
    useFilterStore.getState().clearAll();
    expect(useFilterStore.getState().sortOrder).toBe("name");
  });
});

describe("useFilterStore sortOrder", () => {
  it("is 'died' after reset", () => {
    expect(useFilterStore.getState().sortOrder).toBe("died");
  });

  it("setSortOrder updates the sort order", () => {
    useFilterStore.getState().setSortOrder("lifespan");
    expect(useFilterStore.getState().sortOrder).toBe("lifespan");
  });
});
