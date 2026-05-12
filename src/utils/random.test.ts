import { entries } from "../data/entries";
import { currentEntryId, pickRandomEntry, recentPicks } from "./random";

beforeEach(() => {
  recentPicks.length = 0;
});

describe("currentEntryId", () => {
  it("extracts an entry id from /entry/:id pathname", () => {
    expect(currentEntryId("/entry/google-reader")).toBe("google-reader");
  });

  it("extracts id with hyphens and numbers", () => {
    expect(currentEntryId("/entry/my-app-2")).toBe("my-app-2");
  });

  it("returns null for the root path", () => {
    expect(currentEntryId("/")).toBeNull();
  });

  it("returns null for a non-entry path", () => {
    expect(currentEntryId("/stats")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(currentEntryId("")).toBeNull();
  });
});

describe("pickRandomEntry", () => {
  it("returns an entry from the real pool", () => {
    const pick = pickRandomEntry(null);
    expect(pick).not.toBeNull();
    expect(entries.some((e) => e.id === pick?.id)).toBe(true);
  });

  it("avoids picking the current entry when alternatives exist", () => {
    const [first] = entries;
    const seenCurrentId = new Set<string>();
    for (let i = 0; i < 30; i++) {
      recentPicks.length = 0;
      const pick = pickRandomEntry(first.id);
      if (pick) {
        seenCurrentId.add(pick.id);
      }
    }
    expect(seenCurrentId.has(first.id)).toBe(false);
  });

  it("avoids recently picked entries when alternatives exist", () => {
    const first = pickRandomEntry(null);
    expect(first).not.toBeNull();

    const picks = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const pick = pickRandomEntry(null);
      if (pick) {
        picks.add(pick.id);
      }
    }
    expect(picks.has(first?.id ?? "")).toBe(false);
  });

  it("returns a valid entry when called repeatedly", () => {
    for (let i = 0; i < entries.length + 5; i++) {
      const pick = pickRandomEntry(null);
      expect(pick).not.toBeNull();
      expect(typeof pick?.id).toBe("string");
    }
  });
});
