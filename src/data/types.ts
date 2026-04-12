export type CauseOfDeath =
  | "acqui-killed"
  | "neglected"
  | "outcompeted"
  | "ahead-of-time"
  | "hubris"
  | "pivot"
  | "financial"
  | "legal";

export type TechCategory =
  | "social"
  | "messaging"
  | "hardware"
  | "software"
  | "search-engine"
  | "gaming"
  | "browser"
  | "os"
  | "streaming"
  | "developer-tools"
  | "other";

export interface DeadTech {
  id: string;
  name: string;
  tagline: string;
  born: number;
  died: number;
  peakYear?: number;
  peakMetric?: string;
  causeOfDeath: CauseOfDeath;
  killedBy?: string;
  parent?: string;
  autopsy: string;
  brandColor?: string;
  category: TechCategory;
}

export const CAUSES_OF_DEATH = [
  "acqui-killed",
  "neglected",
  "outcompeted",
  "ahead-of-time",
  "hubris",
  "pivot",
  "financial",
  "legal",
] as const satisfies CauseOfDeath[];

export const CAUSE_LABELS: Record<CauseOfDeath, string> = {
  "acqui-killed": "Acqui-killed",
  neglected: "Neglected",
  outcompeted: "Outcompeted",
  "ahead-of-time": "Ahead of Time",
  hubris: "Hubris",
  pivot: "Pivoted Away",
  financial: "Financial",
  legal: "Legal",
};

export const TECH_CATEGORIES = [
  "social",
  "messaging",
  "hardware",
  "software",
  "search-engine",
  "gaming",
  "browser",
  "os",
  "streaming",
  "developer-tools",
  "other",
] as const satisfies TechCategory[];

export const CATEGORY_LABELS: Record<TechCategory, string> = {
  social: "Social",
  messaging: "Messaging",
  hardware: "Hardware",
  software: "Software",
  "search-engine": "Search",
  gaming: "Gaming",
  browser: "Browser",
  os: "OS",
  streaming: "Streaming",
  "developer-tools": "Dev Tools",
  other: "Other",
};
