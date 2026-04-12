function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/** Returns an hsl() string with saturation reduced by `amount` percent points. */
export function desaturate(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return `hsl(${h}, ${Math.max(0, s - amount)}%, ${l}%)`;
}

/** Returns an hsl() string with lightness increased by `amount` percent points. */
export function lighten(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return `hsl(${h}, ${s}%, ${Math.min(100, l + amount)}%)`;
}

/** Returns the appropriate accent color for a brand color given the current theme. */
export function getAccentColor(brandColor: string, theme: "dark" | "light"): string {
  return theme === "dark" ? desaturate(brandColor, 40) : lighten(brandColor, 20);
}
