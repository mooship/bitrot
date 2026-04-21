import type { DeadTech } from "../data/types";
import { getDailyEntry } from "./daily";

const make = (id: string): DeadTech => ({
  id,
  name: id,
  tagline: "t",
  born: 2000,
  died: 2010,
  causeOfDeath: "neglected",
  autopsy: "a",
  category: "other",
});

describe("getDailyEntry", () => {
  it("returns null for an empty pool", () => {
    expect(getDailyEntry([])).toBeNull();
  });

  it("returns the same entry for the same UTC day", () => {
    const pool = [make("a"), make("b"), make("c")];
    const date = new Date(Date.UTC(2026, 3, 21, 1, 0, 0));
    const a = getDailyEntry(pool, date);
    const b = getDailyEntry(pool, new Date(Date.UTC(2026, 3, 21, 23, 59, 59)));
    expect(a).not.toBeNull();
    expect(a).toBe(b);
  });

  it("advances to a different entry on the next day", () => {
    const pool = [make("a"), make("b"), make("c")];
    const day1 = getDailyEntry(pool, new Date(Date.UTC(2026, 3, 21)));
    const day2 = getDailyEntry(pool, new Date(Date.UTC(2026, 3, 22)));
    expect(day1).not.toBeNull();
    expect(day2).not.toBeNull();
    expect(day1).not.toBe(day2);
  });

  it("is stable across input-array orderings", () => {
    const pool = [make("a"), make("b"), make("c")];
    const reversed = [...pool].reverse();
    const date = new Date(Date.UTC(2026, 3, 21));
    expect(getDailyEntry(pool, date)).toEqual(getDailyEntry(reversed, date));
  });

  it("returns an entry from the pool", () => {
    const pool = [make("alpha"), make("beta"), make("gamma")];
    for (let offset = 0; offset < 10; offset++) {
      const d = new Date(Date.UTC(2026, 0, 1 + offset));
      const picked = getDailyEntry(pool, d);
      expect(pool).toContainEqual(picked);
    }
  });
});
