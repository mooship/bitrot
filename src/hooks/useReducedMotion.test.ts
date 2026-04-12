import { renderHook } from "@testing-library/react";

describe("useReducedMotion", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns false when prefers-reduced-motion does not match", async () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { useReducedMotion } = await import("./useReducedMotion");
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when prefers-reduced-motion matches", async () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

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
