import type { CSSProperties } from "react";
import { useThemeStore } from "../stores/useThemeStore";
import { getAccentColor } from "../utils/color";

export function useEntryAccent(brandColor: string | undefined): CSSProperties | undefined {
  const theme = useThemeStore((s) => s.theme);
  if (!brandColor) {
    return undefined;
  }
  return { "--entry-accent": getAccentColor(brandColor, theme) } as CSSProperties;
}
