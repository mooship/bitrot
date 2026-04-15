import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import type { DeadTech } from "../data/types";
import { useFilterStore } from "../stores/useFilterStore";
import { usePourStore } from "../stores/usePourStore";
import { useToastStore } from "../stores/useToastStore";

export function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

export function resetFilterStore() {
  useFilterStore.setState({
    activeCauses: new Set(),
    activeCategories: new Set(),
    searchQuery: "",
    sortOrder: "died",
  });
}

export function resetPourStore() {
  usePourStore.setState({
    counts: {},
    globalCount: 0,
    pouredThisSession: new Set(),
    pendingPours: new Set(),
    loading: false,
  });
}

export function resetToastStore() {
  useToastStore.setState({ toast: null });
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
