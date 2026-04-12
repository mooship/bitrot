import { act, renderHook } from "@testing-library/react";
import { useHashRoute } from "./useHashRoute";

beforeEach(() => {
  history.pushState(null, "", window.location.pathname);
});

describe("useHashRoute", () => {
  it("returns home route with null entryId when hash is empty", () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toEqual({ page: "home", entryId: null });
  });

  it("parses entry id from hash", () => {
    window.location.hash = "/entry/google-reader";
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toEqual({ page: "home", entryId: "google-reader" });
  });

  it("returns home route with null entryId for non-matching hash patterns", () => {
    window.location.hash = "/other";
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toEqual({ page: "home", entryId: null });
  });

  it("returns privacy route for #/privacy hash", () => {
    window.location.hash = "/privacy";
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toEqual({ page: "privacy" });
  });

  it("navigateTo sets the hash for an entry", () => {
    const { result } = renderHook(() => useHashRoute());

    act(() => {
      result.current.navigateTo("vine");
    });

    expect(window.location.hash).toBe("#/entry/vine");
  });

  it("navigateTo(null) clears the hash", () => {
    window.location.hash = "/entry/vine";
    const { result } = renderHook(() => useHashRoute());

    act(() => {
      result.current.navigateTo(null);
    });

    expect(window.location.hash).toBe("");
  });

  it("responds to external hashchange events", () => {
    const { result } = renderHook(() => useHashRoute());

    act(() => {
      window.location.hash = "/entry/myspace";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(result.current.route).toEqual({ page: "home", entryId: "myspace" });
  });

  it("handles entry ids with hyphens", () => {
    window.location.hash = "/entry/windows-phone";
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.route).toEqual({ page: "home", entryId: "windows-phone" });
  });
});
