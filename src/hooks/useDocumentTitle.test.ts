import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDocumentTitle } from "./useDocumentTitle";

describe("useDocumentTitle", () => {
  let originalTitle: string;
  let metaEl: HTMLMetaElement;

  beforeEach(() => {
    originalTitle = document.title;
    metaEl = document.createElement("meta");
    metaEl.setAttribute("name", "description");
    metaEl.setAttribute("content", "original description");
    document.head.appendChild(metaEl);
  });

  afterEach(() => {
    document.title = originalTitle;
    metaEl.remove();
  });

  it("sets document.title on mount and restores it on unmount", () => {
    const { unmount } = renderHook(() => useDocumentTitle("New Title"));

    expect(document.title).toBe("New Title");

    unmount();

    expect(document.title).toBe(originalTitle);
  });

  it("sets meta description on mount when provided and restores on unmount", () => {
    const { unmount } = renderHook(() =>
      useDocumentTitle("New Title", "New description"),
    );

    expect(metaEl.getAttribute("content")).toBe("New description");

    unmount();

    expect(metaEl.getAttribute("content")).toBe("original description");
  });

  it("does not touch meta description when not provided", () => {
    renderHook(() => useDocumentTitle("New Title"));

    expect(metaEl.getAttribute("content")).toBe("original description");
  });
});
