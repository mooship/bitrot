import type { Mock } from "vitest";
import { fetchAllPours, incrementPour } from "../api/pours";
import { usePourStore } from "./usePourStore";
import { useToastStore } from "./useToastStore";

vi.mock("../api/pours", () => ({
  fetchAllPours: vi.fn(),
  incrementPour: vi.fn(),
}));

const mockedFetchAllPours = fetchAllPours as Mock;
const mockedIncrementPour = incrementPour as Mock;

beforeEach(() => {
  usePourStore.setState({
    counts: {},
    globalCount: 0,
    pouredThisSession: new Set(),
    pendingPours: new Set(),
    loading: false,
  });
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe("fetchPours", () => {
  it("sets loading true then false on success", async () => {
    mockedFetchAllPours.mockResolvedValue({ vine: 10 });

    const promise = usePourStore.getState().fetchPours();
    expect(usePourStore.getState().loading).toBe(true);

    await promise;
    expect(usePourStore.getState().loading).toBe(false);
  });

  it("populates counts and globalCount", async () => {
    mockedFetchAllPours.mockResolvedValue({
      "google-reader": 42,
      vine: 10,
    });

    await usePourStore.getState().fetchPours();

    const state = usePourStore.getState();
    expect(state.counts).toEqual({ "google-reader": 42, vine: 10 });
    expect(state.globalCount).toBe(52);
  });

  it("sets loading false on API failure", async () => {
    mockedFetchAllPours.mockRejectedValue(new Error("Network error"));

    await usePourStore.getState().fetchPours();

    expect(usePourStore.getState().loading).toBe(false);
    expect(usePourStore.getState().counts).toEqual({});
  });
});

describe("pour", () => {
  it("optimistically increments count and globalCount", async () => {
    mockedIncrementPour.mockResolvedValue(1);
    usePourStore.setState({ counts: { vine: 5 }, globalCount: 5 });

    const promise = usePourStore.getState().pour("vine");

    // Optimistic update happens synchronously
    expect(usePourStore.getState().counts.vine).toBe(6);
    expect(usePourStore.getState().globalCount).toBe(6);

    await promise;
  });

  it("adds entry to pouredThisSession", async () => {
    mockedIncrementPour.mockResolvedValue(1);

    await usePourStore.getState().pour("vine");

    expect(usePourStore.getState().pouredThisSession.has("vine")).toBe(true);
  });

  it("persists poured set to sessionStorage", async () => {
    mockedIncrementPour.mockResolvedValue(1);

    await usePourStore.getState().pour("vine");

    const stored = JSON.parse(sessionStorage.getItem("poured") ?? "[]");
    expect(stored).toContain("vine");
  });

  it("updates count to server-returned value on success", async () => {
    mockedIncrementPour.mockResolvedValue(99);
    usePourStore.setState({ counts: { vine: 5 }, globalCount: 5 });

    await usePourStore.getState().pour("vine");

    expect(usePourStore.getState().counts.vine).toBe(99);
  });

  it("recalculates globalCount from all counts after server confirms", async () => {
    mockedIncrementPour.mockResolvedValue(20);
    usePourStore.setState({ counts: { vine: 5, icq: 10 }, globalCount: 15 });

    await usePourStore.getState().pour("vine");

    expect(usePourStore.getState().globalCount).toBe(30);
  });

  it("adds entry to pendingPours during the API call", async () => {
    let resolvePour!: (v: number) => void;
    mockedIncrementPour.mockReturnValue(
      new Promise((r) => {
        resolvePour = r;
      })
    );

    const promise = usePourStore.getState().pour("vine");
    expect(usePourStore.getState().pendingPours.has("vine")).toBe(true);

    resolvePour(1);
    await promise;
  });

  it("removes entry from pendingPours after success", async () => {
    mockedIncrementPour.mockResolvedValue(1);

    await usePourStore.getState().pour("vine");

    expect(usePourStore.getState().pendingPours.has("vine")).toBe(false);
  });

  it("removes entry from pendingPours after failure", async () => {
    mockedIncrementPour.mockRejectedValue(new Error("fail"));

    await usePourStore.getState().pour("vine");

    expect(usePourStore.getState().pendingPours.has("vine")).toBe(false);
  });

  it("shows a toast on API failure", async () => {
    mockedIncrementPour.mockRejectedValue(new Error("fail"));
    useToastStore.setState({ toast: null });

    await usePourStore.getState().pour("vine");

    expect(useToastStore.getState().toast?.message).toMatch(/couldn't pour/i);
  });

  it("prevents duplicate pours in the same session", async () => {
    mockedIncrementPour.mockResolvedValue(1);

    await usePourStore.getState().pour("vine");
    await usePourStore.getState().pour("vine");

    expect(mockedIncrementPour).toHaveBeenCalledTimes(1);
  });

  it("handles pouring a new entry (count starts at 0)", async () => {
    mockedIncrementPour.mockResolvedValue(1);

    await usePourStore.getState().pour("new-entry");

    expect(usePourStore.getState().counts["new-entry"]).toBe(1);
  });

  it("rolls back count on API failure", async () => {
    mockedIncrementPour.mockRejectedValue(new Error("Server error"));
    usePourStore.setState({ counts: { vine: 5 }, globalCount: 5 });

    await usePourStore.getState().pour("vine");

    expect(usePourStore.getState().counts.vine).toBe(5);
    expect(usePourStore.getState().globalCount).toBe(5);
  });

  it("removes entry from pouredThisSession on API failure", async () => {
    mockedIncrementPour.mockRejectedValue(new Error("Server error"));

    await usePourStore.getState().pour("vine");

    expect(usePourStore.getState().pouredThisSession.has("vine")).toBe(false);
  });

  it("rolls back sessionStorage on API failure", async () => {
    mockedIncrementPour.mockRejectedValue(new Error("Server error"));

    await usePourStore.getState().pour("vine");

    const stored = JSON.parse(sessionStorage.getItem("poured") ?? "[]");
    expect(stored).not.toContain("vine");
  });
});

describe("session recovery", () => {
  it("recovers pouredThisSession from sessionStorage on init", async () => {
    sessionStorage.setItem("poured", JSON.stringify(["vine", "icq"]));
    vi.resetModules();

    const mod = await import("./usePourStore");
    const store = mod.usePourStore;

    expect(store.getState().pouredThisSession.has("vine")).toBe(true);
    expect(store.getState().pouredThisSession.has("icq")).toBe(true);
  });
});
