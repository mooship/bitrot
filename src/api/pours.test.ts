import { fetchAllPours, incrementPour } from "./pours";

describe("fetchAllPours", () => {
  it("returns parsed JSON on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ "google-reader": 42, vine: 10 }),
      })
    );

    const result = await fetchAllPours();
    expect(result).toEqual({ "google-reader": 42, vine: 10 });
  });

  it("throws on HTTP error with status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetchAllPours()).rejects.toThrow("fetchAllPours failed: 500");
  });

  it("propagates network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(fetchAllPours()).rejects.toThrow("Failed to fetch");
  });

  it("calls the correct URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchAllPours();
    expect(mockFetch).toHaveBeenCalledWith("http://localhost:8787/pours");
  });
});

describe("incrementPour", () => {
  it("returns the new count on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ count: 43 }),
      })
    );

    const result = await incrementPour("google-reader");
    expect(result).toBe(43);
  });

  it("sends a POST request to the correct URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 1 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await incrementPour("vine");
    expect(mockFetch).toHaveBeenCalledWith("http://localhost:8787/pours/vine", {
      method: "POST",
    });
  });

  it("throws on HTTP error with status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await expect(incrementPour("vine")).rejects.toThrow("incrementPour failed: 429");
  });
});
