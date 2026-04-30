import { readSessionSet, writeSessionSet } from "./sessionStorage";

const KEY = "test-key";

afterEach(() => {
  sessionStorage.clear();
});

describe("readSessionSet", () => {
  it("returns an empty Set when the key is absent", () => {
    const result = readSessionSet(KEY);
    expect(result).toEqual(new Set());
  });

  it("returns the correct Set for a valid stored array", () => {
    sessionStorage.setItem(KEY, JSON.stringify(["a", "b", "c"]));
    expect(readSessionSet(KEY)).toEqual(new Set(["a", "b", "c"]));
  });

  it("filters out non-string values from stored array", () => {
    sessionStorage.setItem(KEY, JSON.stringify(["a", 42, null, "b"]));
    expect(readSessionSet(KEY)).toEqual(new Set(["a", "b"]));
  });

  it("returns an empty Set when stored value is not an array", () => {
    sessionStorage.setItem(KEY, JSON.stringify({ foo: "bar" }));
    expect(readSessionSet(KEY)).toEqual(new Set());
  });

  it("returns an empty Set when stored JSON is malformed", () => {
    sessionStorage.setItem(KEY, "not-json{{");
    expect(readSessionSet(KEY)).toEqual(new Set());
  });
});

describe("writeSessionSet", () => {
  it("stores values that readSessionSet retrieves correctly", () => {
    const original = new Set(["x", "y", "z"]);
    writeSessionSet(KEY, original);
    expect(readSessionSet(KEY)).toEqual(original);
  });

  it("overwrites a previous value", () => {
    writeSessionSet(KEY, new Set(["old"]));
    writeSessionSet(KEY, new Set(["new"]));
    expect(readSessionSet(KEY)).toEqual(new Set(["new"]));
  });

  it("stores an empty set correctly", () => {
    writeSessionSet(KEY, new Set());
    expect(readSessionSet(KEY)).toEqual(new Set());
  });
});
