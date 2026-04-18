import type { DeadTech } from "../src/data/types.ts";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const BG_DEFAULT = "#0a0a0c";
const FG_PRIMARY = "#fafaf5";
const FG_MUTED = "rgba(250, 250, 245, 0.62)";
const ACCENT_FALLBACK = "#8b8b8b";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace("#", "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) {
    return null;
  }
  const raw = match[1];
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return BG_DEFAULT;
  }
  const f = 1 - Math.max(0, Math.min(1, amount));
  const r = Math.round(rgb.r * f);
  const g = Math.round(rgb.g * f);
  const b = Math.round(rgb.b * f);
  return `rgb(${r}, ${g}, ${b})`;
}

function accentOr(hex: string | undefined): string {
  return hex && hexToRgb(hex) ? hex : ACCENT_FALLBACK;
}

export function buildEntryOgTemplate(entry: DeadTech): Record<string, unknown> {
  const accent = accentOr(entry.brandColor);
  const bgTop = entry.brandColor ? darken(entry.brandColor, 0.75) : "#141418";
  const lifespan = `${entry.born} – ${entry.died}`;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: `linear-gradient(135deg, ${bgTop} 0%, ${BG_DEFAULT} 70%)`,
        color: FG_PRIMARY,
        fontFamily: "Instrument Sans",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "26px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: FG_MUTED,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: accent,
                  },
                },
              },
              { type: "div", props: { children: "Bitrot" } },
              { type: "div", props: { style: { opacity: 0.5 }, children: "·" } },
              { type: "div", props: { children: "Dead Tech Memorial" } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: "20px" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Fraunces",
                    fontSize: entry.name.length > 22 ? "88px" : "108px",
                    fontWeight: 600,
                    lineHeight: 1.02,
                    letterSpacing: "-0.02em",
                  },
                  children: entry.name,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "34px",
                    lineHeight: 1.3,
                    color: FG_MUTED,
                    maxWidth: "960px",
                  },
                  children: entry.tagline,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "30px",
              color: FG_MUTED,
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", gap: "18px" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { width: "44px", height: "3px", background: accent },
                      },
                    },
                    { type: "div", props: { children: lifespan } },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: "24px", letterSpacing: "0.12em", textTransform: "uppercase" },
                  children: "bitrot.timothybrits.co.za",
                },
              },
            ],
          },
        },
      ],
    },
  };
}
