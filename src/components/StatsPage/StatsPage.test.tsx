import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { entries } from "../../data/entries";
import { useFilterStore } from "../../stores/useFilterStore";
import { usePourStore } from "../../stores/usePourStore";
import { renderWithRouter, resetFilterStore, resetPourStore } from "../../test/fixtures";
import { StatsPage } from "./StatsPage";

beforeEach(() => {
  resetPourStore();
  resetFilterStore();
});

describe("StatsPage", () => {
  it("renders the page heading", () => {
    renderWithRouter(<StatsPage />);
    expect(screen.getByRole("heading", { name: "Obituary Stats" })).toBeInTheDocument();
  });

  it("shows the total entry count", () => {
    renderWithRouter(<StatsPage />);
    expect(screen.getByText(String(entries.length))).toBeInTheDocument();
  });

  it("renders the Cause of Death section", () => {
    renderWithRouter(<StatsPage />);
    expect(screen.getByRole("heading", { name: "Cause of Death" })).toBeInTheDocument();
  });

  it("renders the Category section", () => {
    renderWithRouter(<StatsPage />);
    expect(screen.getByRole("heading", { name: "Category" })).toBeInTheDocument();
  });

  it("renders Short-lived and Long-lived sections", () => {
    renderWithRouter(<StatsPage />);
    expect(screen.getByRole("heading", { name: "Short-lived" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Long-lived" })).toBeInTheDocument();
  });

  it("does not show Most Mourned section when no pours exist", () => {
    renderWithRouter(<StatsPage />);
    expect(screen.queryByRole("heading", { name: "Most Mourned" })).not.toBeInTheDocument();
  });

  it("shows Most Mourned section when pour counts exist", () => {
    usePourStore.setState({ counts: { "google-reader": 42 } });
    renderWithRouter(<StatsPage />);
    expect(screen.getByRole("heading", { name: "Most Mourned" })).toBeInTheDocument();
    expect(screen.getByText("42 pours")).toBeInTheDocument();
  });

  it("renders the Deaths by Decade section", () => {
    renderWithRouter(<StatsPage />);
    expect(screen.getByRole("heading", { name: "Deaths by Decade" })).toBeInTheDocument();
  });

  it("renders the Average Lifespan by Category section", () => {
    renderWithRouter(<StatsPage />);
    expect(
      screen.getByRole("heading", { name: "Average Lifespan by Category" })
    ).toBeInTheDocument();
  });

  it("clicking a Cause of Death bar sets the cause filter", async () => {
    renderWithRouter(<StatsPage />);
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: /Show .* Hubris entries/ });
    await user.click(button);
    const state = useFilterStore.getState();
    expect(state.activeCauses.has("hubris")).toBe(true);
    expect(state.activeCategories.size).toBe(0);
  });

  it("clicking a Category bar sets the category filter and clears causes", async () => {
    useFilterStore.setState({ activeCauses: new Set(["pivot"]) });
    renderWithRouter(<StatsPage />);
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: /Show .* Social entries/ });
    await user.click(button);
    const state = useFilterStore.getState();
    expect(state.activeCategories.has("social")).toBe(true);
    expect(state.activeCauses.size).toBe(0);
  });
});
