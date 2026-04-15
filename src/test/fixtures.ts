import type { DeadTech } from "../data/types";
import { useFilterStore } from "../stores/useFilterStore";

export function resetFilterStore() {
  useFilterStore.setState({
    activeCauses: new Set(),
    activeCategories: new Set(),
    searchQuery: "",
  });
}

export const mockEntry: DeadTech = {
  id: "google-reader",
  name: "Google Reader",
  tagline: "The RSS reader that united the internet",
  born: 2005,
  died: 2013,
  causeOfDeath: "neglected",
  autopsy: "Google killed it because they wanted everyone on Google+.",
  category: "software",
  brandColor: "#4285F4",
  parent: "Google",
  killedBy: "Google+",
  peakYear: 2012,
  peakMetric: "24M users",
};

export const mockEntryMinimal: DeadTech = {
  id: "test-entry",
  name: "Test Entry",
  tagline: "A minimal test entry",
  born: 2010,
  died: 2015,
  causeOfDeath: "hubris",
  autopsy: "It failed spectacularly.",
  category: "other",
};
