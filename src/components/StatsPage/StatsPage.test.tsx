import { screen } from "@testing-library/react";
import { entries } from "../../data/entries";
import { usePourStore } from "../../stores/usePourStore";
import { renderWithRouter, resetPourStore } from "../../test/fixtures";
import { StatsPage } from "./StatsPage";

beforeEach(() => {
  resetPourStore();
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
});
