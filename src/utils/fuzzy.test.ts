import { fuzzyMatch } from "./fuzzy";

describe("fuzzyMatch", () => {
  it("matches exact substring", () => {
    expect(fuzzyMatch("reader", "The Google Reader story")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(fuzzyMatch("GOOGLE", "google reader")).toBe(true);
  });

  it("returns true for empty query", () => {
    expect(fuzzyMatch("", "anything")).toBe(true);
    expect(fuzzyMatch("   ", "anything")).toBe(true);
  });

  it("returns false when no overlap", () => {
    expect(fuzzyMatch("xylophone", "Google Reader")).toBe(false);
  });

  it("tolerates a one-character typo in a medium word", () => {
    expect(fuzzyMatch("googel", "Google Reader")).toBe(true);
    expect(fuzzyMatch("gogle", "Google Reader")).toBe(true);
  });

  it("tolerates two-character typos only in longer words", () => {
    expect(fuzzyMatch("stadiaa", "Google Stadia shut down")).toBe(true);
    expect(fuzzyMatch("xxy", "stadia")).toBe(false);
  });

  it("requires every whitespace-separated term to match", () => {
    expect(fuzzyMatch("google reader", "Google Reader was great")).toBe(true);
    expect(fuzzyMatch("google octopus", "Google Reader was great")).toBe(false);
  });

  it("does not tolerate typos on very short queries", () => {
    expect(fuzzyMatch("xy", "abc product")).toBe(false);
    expect(fuzzyMatch("abd", "abd product")).toBe(true);
  });

  it("matches tokens that include + or # punctuation", () => {
    expect(fuzzyMatch("google+", "Google+ had 540M accounts")).toBe(true);
    expect(fuzzyMatch("c#", "C# the language")).toBe(true);
  });
});
