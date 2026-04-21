import { screen } from "@testing-library/react";
import { entries } from "../../data/entries";
import { useFilterStore } from "../../stores/useFilterStore";
import { renderWithRouter, resetFilterStore } from "../../test/fixtures";
import { getDailyEntry } from "../../utils/daily";
import { DailyObituary } from "./DailyObituary";

beforeEach(() => {
  resetFilterStore();
});

describe("DailyObituary", () => {
  it("renders the daily entry name and tagline", () => {
    renderWithRouter(<DailyObituary />);
    const daily = getDailyEntry(entries);
    if (!daily) {
      throw new Error("no daily entry");
    }
    expect(screen.getByText(daily.name)).toBeInTheDocument();
    expect(screen.getByText(daily.tagline)).toBeInTheDocument();
  });

  it("renders a link to the entry page", () => {
    renderWithRouter(<DailyObituary />);
    const daily = getDailyEntry(entries);
    if (!daily) {
      throw new Error("no daily entry");
    }
    const link = screen.getByRole("link", { name: new RegExp(daily.name) });
    expect(link).toHaveAttribute("href", `/entry/${daily.id}`);
  });

  it("hides when a cause filter is active", () => {
    useFilterStore.setState({ activeCauses: new Set(["neglected"]) });
    const { container } = renderWithRouter(<DailyObituary />);
    expect(container.querySelector("aside")).toBeNull();
  });

  it("hides when a search query is set", () => {
    useFilterStore.getState().setSearchQuery("google");
    const { container } = renderWithRouter(<DailyObituary />);
    expect(container.querySelector("aside")).toBeNull();
  });

  it("hides when a year range is active", () => {
    useFilterStore.getState().setYearRange(2015, null);
    const { container } = renderWithRouter(<DailyObituary />);
    expect(container.querySelector("aside")).toBeNull();
  });
});
