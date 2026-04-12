import { desaturate, getAccentColor, lighten } from "./color";

describe("desaturate", () => {
  it("returns correct HSL for pure red with no desaturation", () => {
    expect(desaturate("#ff0000", 0)).toBe("hsl(0, 100%, 50%)");
  });

  it("reduces saturation by the given amount", () => {
    expect(desaturate("#ff0000", 40)).toBe("hsl(0, 60%, 50%)");
  });

  it("clamps saturation at 0 when amount exceeds current", () => {
    expect(desaturate("#ff0000", 150)).toBe("hsl(0, 0%, 50%)");
  });

  it("handles grey input (already zero saturation)", () => {
    expect(desaturate("#808080", 10)).toBe("hsl(0, 0%, 50%)");
  });

  it("handles a real brand color (Google blue)", () => {
    const result = desaturate("#4285F4", 40);
    expect(result).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });
});

describe("lighten", () => {
  it("returns correct HSL for pure red with no lightening", () => {
    expect(lighten("#ff0000", 0)).toBe("hsl(0, 100%, 50%)");
  });

  it("increases lightness by the given amount", () => {
    expect(lighten("#ff0000", 20)).toBe("hsl(0, 100%, 70%)");
  });

  it("clamps lightness at 100 when amount exceeds headroom", () => {
    expect(lighten("#ff0000", 80)).toBe("hsl(0, 100%, 100%)");
  });

  it("lightens pure black", () => {
    expect(lighten("#000000", 50)).toBe("hsl(0, 0%, 50%)");
  });

  it("handles a real brand color", () => {
    const result = lighten("#4285F4", 20);
    expect(result).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });
});

describe("getAccentColor", () => {
  it("desaturates by 40 for dark theme", () => {
    const result = getAccentColor("#ff0000", "dark");
    expect(result).toBe(desaturate("#ff0000", 40));
  });

  it("lightens by 20 for light theme", () => {
    const result = getAccentColor("#ff0000", "light");
    expect(result).toBe(lighten("#ff0000", 20));
  });

  it("produces valid HSL for a real brand color in dark theme", () => {
    const result = getAccentColor("#4285F4", "dark");
    expect(result).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  it("produces valid HSL for a real brand color in light theme", () => {
    const result = getAccentColor("#4285F4", "light");
    expect(result).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });
});
