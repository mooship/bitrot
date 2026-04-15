import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDocumentTitle } from "./useDocumentTitle";

describe("useDocumentTitle", () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it("sets document.title on mount and restores it on unmount", () => {
    const { unmount } = renderHook(() => useDocumentTitle("New Title"));

    expect(document.title).toBe("New Title");

    unmount();

    expect(document.title).toBe(originalTitle);
  });
});
