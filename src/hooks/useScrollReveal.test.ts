import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";

// Mock useReducedMotion at module level
vi.mock("./useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

import { useReducedMotion } from "./useReducedMotion";
import { useScrollReveal } from "./useScrollReveal";

describe("useScrollReveal", () => {
  it("returns true when IntersectionObserver fires isIntersecting", () => {
    const el = document.createElement("div");
    const ref = { current: el } as RefObject<Element>;

    const { result } = renderHook(() => useScrollReveal(ref));
    expect(result.current).toBe(true);
  });

  it("returns true immediately when reduced motion is enabled", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const ref = { current: null } as RefObject<Element | null>;
    const { result } = renderHook(() => useScrollReveal(ref));
    expect(result.current).toBe(true);

    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("returns false when ref has no element and no reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);

    // Override IntersectionObserver to not auto-trigger
    const originalIO = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn().mockReturnValue([]);
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
    } as unknown as typeof IntersectionObserver;

    const ref = { current: null } as RefObject<Element | null>;
    const { result } = renderHook(() => useScrollReveal(ref));
    expect(result.current).toBe(false);

    globalThis.IntersectionObserver = originalIO;
  });

  it("disconnects observer on unmount", () => {
    const disconnect = vi.fn();
    const originalIO = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      constructor(private cb: IntersectionObserverCallback) {}
      observe(target: Element) {
        // Don't trigger - keep element as not visible
      }
      unobserve = vi.fn();
      disconnect = disconnect;
      takeRecords = vi.fn().mockReturnValue([]);
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
    } as unknown as typeof IntersectionObserver;

    const el = document.createElement("div");
    const ref = { current: el } as RefObject<Element>;

    const { unmount } = renderHook(() => useScrollReveal(ref));
    unmount();

    expect(disconnect).toHaveBeenCalled();

    globalThis.IntersectionObserver = originalIO;
  });
});
