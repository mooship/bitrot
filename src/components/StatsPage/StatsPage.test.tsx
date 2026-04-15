import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { entries } from "../../data/entries";
import { usePourStore } from "../../stores/usePourStore";
import { StatsPage } from "./StatsPage";

function renderStatsPage() {
  return render(
    <MemoryRouter>
      <StatsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  usePourStore.setState({
    counts: {},
    globalCount: 0,
    pouredThisSession: new Set(),
    pendingPours: new Set(),
    loading: false,
  });
});

describe("StatsPage", () => {
  it("renders the page heading", () => {
    renderStatsPage();
    expect(screen.getByRole("heading", { name: "Obituary Stats" })).toBeInTheDocument();
  });

  it("shows the total entry count", () => {
    renderStatsPage();
    expect(screen.getByText(String(entries.length))).toBeInTheDocument();
  });

  it("renders the Cause of Death section", () => {
    renderStatsPage();
    expect(screen.getByRole("heading", { name: "Cause of Death" })).toBeInTheDocument();
  });

  it("renders the Category section", () => {
    renderStatsPage();
    expect(screen.getByRole("heading", { name: "Category" })).toBeInTheDocument();
  });

  it("renders Short-lived and Long-lived sections", () => {
    renderStatsPage();
    expect(screen.getByRole("heading", { name: "Short-lived" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Long-lived" })).toBeInTheDocument();
  });

  it("does not show Most Mourned section when no pours exist", () => {
    renderStatsPage();
    expect(screen.queryByRole("heading", { name: "Most Mourned" })).not.toBeInTheDocument();
  });

  it("shows Most Mourned section when pour counts exist", () => {
    usePourStore.setState({ counts: { "google-reader": 42 } });
    renderStatsPage();
    expect(screen.getByRole("heading", { name: "Most Mourned" })).toBeInTheDocument();
    expect(screen.getByText("42 pours")).toBeInTheDocument();
  });
});
