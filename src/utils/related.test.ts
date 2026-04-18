import type { DeadTech } from "../data/types";
import { getRelatedEntries } from "./related";

function makeEntry(overrides: Partial<DeadTech> & Pick<DeadTech, "id">): DeadTech {
  return {
    name: overrides.id,
    tagline: "",
    born: 2000,
    died: 2010,
    causeOfDeath: "neglected",
    autopsy: "",
    category: "software",
    ...overrides,
  };
}

describe("getRelatedEntries", () => {
  it("excludes the target entry from results", () => {
    const target = makeEntry({ id: "a" });
    const pool = [target, makeEntry({ id: "b" })];
    const related = getRelatedEntries(target, pool);
    expect(related.map((e) => e.id)).not.toContain("a");
  });

  it("ranks same-cause matches above same-category matches", () => {
    const target = makeEntry({ id: "target", causeOfDeath: "hubris", category: "social" });
    const sameCause = makeEntry({ id: "same-cause", causeOfDeath: "hubris", category: "gaming" });
    const sameCategory = makeEntry({
      id: "same-cat",
      causeOfDeath: "neglected",
      category: "social",
    });
    const related = getRelatedEntries(target, [target, sameCategory, sameCause]);
    expect(related[0].id).toBe("same-cause");
    expect(related[1].id).toBe("same-cat");
  });

  it("includes a contemporaneous entry as a weak match", () => {
    const target = makeEntry({ id: "target", born: 2005, died: 2010 });
    const overlap = makeEntry({
      id: "overlap",
      born: 2008,
      died: 2015,
      causeOfDeath: "pivot",
      category: "browser",
    });
    const unrelated = makeEntry({
      id: "unrelated",
      born: 1990,
      died: 1995,
      causeOfDeath: "pivot",
      category: "browser",
    });
    const related = getRelatedEntries(target, [target, overlap, unrelated]);
    expect(related.map((e) => e.id)).toEqual(["overlap"]);
  });

  it("filters out entries with zero score", () => {
    const target = makeEntry({
      id: "target",
      born: 2000,
      died: 2005,
      causeOfDeath: "hubris",
      category: "social",
    });
    const noOverlapNoMatch = makeEntry({
      id: "no-match",
      born: 2020,
      died: 2025,
      causeOfDeath: "pivot",
      category: "gaming",
    });
    const related = getRelatedEntries(target, [target, noOverlapNoMatch]);
    expect(related).toEqual([]);
  });

  it("respects the limit", () => {
    const target = makeEntry({ id: "target", causeOfDeath: "hubris" });
    const pool = [
      target,
      ...Array.from({ length: 5 }, (_, i) => makeEntry({ id: `c${i}`, causeOfDeath: "hubris" })),
    ];
    expect(getRelatedEntries(target, pool, 2)).toHaveLength(2);
    expect(getRelatedEntries(target, pool, 4)).toHaveLength(4);
  });

  it("defaults to 3 results", () => {
    const target = makeEntry({ id: "target", causeOfDeath: "hubris" });
    const pool = [
      target,
      ...Array.from({ length: 5 }, (_, i) => makeEntry({ id: `c${i}`, causeOfDeath: "hubris" })),
    ];
    expect(getRelatedEntries(target, pool)).toHaveLength(3);
  });
});
