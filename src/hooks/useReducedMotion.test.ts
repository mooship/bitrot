import { renderHook } from "@testing-library/react";
import { mockMatchMedia } from "../test/setup";

describe("useReducedMotion", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns false when prefers-reduced-motion does not match", async () => {
    mockMatchMedia(() => false);

    const { useReducedMotion } = await import("./useReducedMotion");
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when prefers-reduced-motion matches", async () => {
    mockMatchMedia((query) => query === "(prefers-reduced-motion: reduce)");

    const { useReducedMotion } = await import("./useReducedMotion");
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("subscribes to change events on the media query", async () => {
    const addEventListener = vi.fn();
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { useReducedMotion } = await import("./useReducedMotion");
    renderHook(() => useReducedMotion());
    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
