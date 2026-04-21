import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useNavigate, useSearchParams } from "react-router-dom";
import { useFilterStore } from "../stores/useFilterStore";
import { resetFilterStore } from "../test/fixtures";
import { useFilterUrlSync } from "./useFilterUrlSync";

function makeWrapper(initialUrl: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>;
  };
}

function renderSync(initialUrl = "/") {
  return renderHook(
    () => {
      useFilterUrlSync();
      const [params] = useSearchParams();
      return params;
    },
    { wrapper: makeWrapper(initialUrl) }
  );
}

function renderSyncWithNavigate(initialUrl = "/") {
  return renderHook(
    () => {
      useFilterUrlSync();
      const [params] = useSearchParams();
      const navigate = useNavigate();
      return { params, navigate };
    },
    { wrapper: makeWrapper(initialUrl) }
  );
}

beforeEach(() => {
  resetFilterStore();
});

describe("useFilterUrlSync", () => {
  describe("URL → store hydration", () => {
    it("hydrates searchQuery from the q param", () => {
      renderSync("/?q=google");
      expect(useFilterStore.getState().searchQuery).toBe("google");
    });

    it("hydrates activeCauses from the cause param", () => {
      renderSync("/?cause=neglected,hubris");
      const state = useFilterStore.getState();
      expect(state.activeCauses.has("neglected")).toBe(true);
      expect(state.activeCauses.has("hubris")).toBe(true);
      expect(state.activeCauses.size).toBe(2);
    });

    it("hydrates activeCategories from the category param", () => {
      renderSync("/?category=social,gaming");
      const state = useFilterStore.getState();
      expect(state.activeCategories.has("social")).toBe(true);
      expect(state.activeCategories.has("gaming")).toBe(true);
      expect(state.activeCategories.size).toBe(2);
    });

    it("hydrates all three params together", () => {
      renderSync("/?q=reader&cause=neglected&category=software");
      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("reader");
      expect(state.activeCauses.has("neglected")).toBe(true);
      expect(state.activeCategories.has("software")).toBe(true);
    });

    it("hydrates sortOrder from the sort param", () => {
      renderSync("/?sort=lifespan");
      expect(useFilterStore.getState().sortOrder).toBe("lifespan");
    });

    it("falls back to 'died' when sort param is invalid", () => {
      renderSync("/?sort=bogus");
      expect(useFilterStore.getState().sortOrder).toBe("died");
    });

    it("defaults sortOrder to 'died' when param absent", () => {
      renderSync("/");
      expect(useFilterStore.getState().sortOrder).toBe("died");
    });

    it("ignores unknown cause values but keeps valid ones", () => {
      renderSync("/?cause=unknown,neglected,fake");
      const state = useFilterStore.getState();
      expect(state.activeCauses.has("neglected")).toBe(true);
      expect(state.activeCauses.size).toBe(1);
    });

    it("ignores unknown category values but keeps valid ones", () => {
      renderSync("/?category=not-real,social");
      const state = useFilterStore.getState();
      expect(state.activeCategories.has("social")).toBe(true);
      expect(state.activeCategories.size).toBe(1);
    });

    it("starts with empty state when URL has no params", () => {
      renderSync("/");
      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("");
      expect(state.activeCauses.size).toBe(0);
      expect(state.activeCategories.size).toBe(0);
    });

    it("clears prior store state when URL has no params on mount", () => {
      useFilterStore.setState({
        searchQuery: "stale",
        activeCauses: new Set(["neglected"]),
        activeCategories: new Set(["social"]),
      });
      renderSync("/");
      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("");
      expect(state.activeCauses.size).toBe(0);
      expect(state.activeCategories.size).toBe(0);
    });

    it("URL-decodes the q param", () => {
      renderSync("/?q=hello%20world");
      expect(useFilterStore.getState().searchQuery).toBe("hello world");
    });
  });

  describe("store → URL sync", () => {
    it("writes search query to URL when store changes", () => {
      const { result } = renderSync("/");

      act(() => {
        useFilterStore.getState().setSearchQuery("google");
      });

      expect(result.current.get("q")).toBe("google");
    });

    it("writes active causes as comma-separated to URL", () => {
      const { result } = renderSync("/");

      act(() => {
        useFilterStore.getState().toggleCause("neglected");
        useFilterStore.getState().toggleCause("hubris");
      });

      const cause = result.current.get("cause");
      expect(cause).not.toBeNull();
      expect((cause ?? "").split(",").sort()).toEqual(["hubris", "neglected"]);
    });

    it("writes active categories as comma-separated to URL", () => {
      const { result } = renderSync("/");

      act(() => {
        useFilterStore.getState().toggleCategory("social");
      });

      expect(result.current.get("category")).toBe("social");
    });

    it("removes q param when search query becomes empty", () => {
      const { result } = renderSync("/?q=foo");
      expect(result.current.get("q")).toBe("foo");

      act(() => {
        useFilterStore.getState().setSearchQuery("");
      });

      expect(result.current.has("q")).toBe(false);
    });

    it("removes cause param when no causes are active", () => {
      const { result } = renderSync("/?cause=neglected");

      act(() => {
        useFilterStore.getState().toggleCause("neglected");
      });

      expect(result.current.has("cause")).toBe(false);
    });

    it("trims whitespace from search query when writing to URL", () => {
      const { result } = renderSync("/");

      act(() => {
        useFilterStore.getState().setSearchQuery("  google  ");
      });

      expect(result.current.get("q")).toBe("google");
    });

    it("clearAll empties all URL params", () => {
      const { result } = renderSync("/?q=foo&cause=neglected&category=social&sort=lifespan");

      act(() => {
        useFilterStore.getState().clearAll();
      });

      expect(result.current.has("q")).toBe(false);
      expect(result.current.has("cause")).toBe(false);
      expect(result.current.has("category")).toBe(false);
      expect(result.current.has("sort")).toBe(false);
    });

    it("writes sort param when non-default", () => {
      const { result } = renderSync("/");

      act(() => {
        useFilterStore.getState().setSortOrder("name");
      });

      expect(result.current.get("sort")).toBe("name");
    });

    it("omits sort param when value is the default 'died'", () => {
      const { result } = renderSync("/?sort=lifespan");

      act(() => {
        useFilterStore.getState().setSortOrder("died");
      });

      expect(result.current.has("sort")).toBe(false);
    });

    it("writes dir param only when direction is non-default for the order", () => {
      const { result } = renderSync("/");

      act(() => {
        useFilterStore.getState().toggleSortDirection();
      });

      expect(result.current.get("dir")).toBe("asc");

      act(() => {
        useFilterStore.getState().toggleSortDirection();
      });

      expect(result.current.has("dir")).toBe(false);
    });

    it("writes from/to params for year range", () => {
      const { result } = renderSync("/");

      act(() => {
        useFilterStore.getState().setYearRange(2010, 2015);
      });

      expect(result.current.get("from")).toBe("2010");
      expect(result.current.get("to")).toBe("2015");
    });

    it("removes from/to params when year range is cleared", () => {
      const { result } = renderSync("/?from=2010&to=2015");
      expect(result.current.get("from")).toBe("2010");

      act(() => {
        useFilterStore.getState().setYearRange(null, null);
      });

      expect(result.current.has("from")).toBe(false);
      expect(result.current.has("to")).toBe(false);
    });
  });

  describe("year-range and direction hydration", () => {
    it("hydrates fromYear and toYear from params", () => {
      renderSync("/?from=2005&to=2015");
      const state = useFilterStore.getState();
      expect(state.fromYear).toBe(2005);
      expect(state.toYear).toBe(2015);
    });

    it("ignores out-of-bounds year params", () => {
      renderSync("/?from=1500&to=3000");
      const state = useFilterStore.getState();
      expect(state.fromYear).toBeNull();
      expect(state.toYear).toBeNull();
    });

    it("hydrates dir param when valid for the selected sort", () => {
      renderSync("/?sort=name&dir=desc");
      expect(useFilterStore.getState().sortDirection).toBe("desc");
    });

    it("falls back to default direction when dir param is bogus", () => {
      renderSync("/?sort=name&dir=sideways");
      expect(useFilterStore.getState().sortDirection).toBe("asc");
    });
  });

  describe("round-trip and external URL changes", () => {
    it("does not feed back: hydrating from URL settles without re-writing", () => {
      const { result } = renderSync("/?q=test&cause=neglected");
      expect(result.current.get("q")).toBe("test");
      expect(result.current.get("cause")).toBe("neglected");
      expect(useFilterStore.getState().searchQuery).toBe("test");
    });

    it("re-hydrates store when URL changes externally (e.g. back button)", () => {
      const { result } = renderSyncWithNavigate("/?q=initial");
      expect(useFilterStore.getState().searchQuery).toBe("initial");

      act(() => {
        result.current.navigate("/?q=changed&cause=hubris");
      });

      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("changed");
      expect(state.activeCauses.has("hubris")).toBe(true);
    });

    it("clears store when navigating to a URL with no params", () => {
      const { result } = renderSyncWithNavigate("/?q=initial&category=social");
      expect(useFilterStore.getState().searchQuery).toBe("initial");

      act(() => {
        result.current.navigate("/");
      });

      const state = useFilterStore.getState();
      expect(state.searchQuery).toBe("");
      expect(state.activeCategories.size).toBe(0);
    });
  });
});
