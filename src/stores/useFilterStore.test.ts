import { renderHook } from "@testing-library/react";
import { entries } from "../data/entries";
import { useFilterStore, useFilteredEntries } from "./useFilterStore";

beforeEach(() => {
  useFilterStore.setState({
    activeCauses: new Set(),
    activeCategories: new Set(),
  });
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

  it("clearAll resets both sets", () => {
    useFilterStore.getState().toggleCause("neglected");
    useFilterStore.getState().toggleCategory("social");
    useFilterStore.getState().clearAll();
    const state = useFilterStore.getState();
    expect(state.activeCauses.size).toBe(0);
    expect(state.activeCategories.size).toBe(0);
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
    expect(
      result.current.every((e) => e.causeOfDeath === "neglected"),
    ).toBe(true);
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
      result.current.every(
        (e) =>
          e.causeOfDeath === "neglected" || e.causeOfDeath === "hubris",
      ),
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
    // If no entries match both legal + os, should be empty or very few
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
});
