import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { entries } from "../../data/entries";
import { CAUSES_OF_DEATH, CAUSE_LABELS, CATEGORY_LABELS, TECH_CATEGORIES } from "../../data/types";
import { useFilterStore } from "../../stores/useFilterStore";
import { FilterBar } from "./FilterBar";

beforeEach(() => {
  useFilterStore.setState({
    activeCauses: new Set(),
    activeCategories: new Set(),
  });
});

describe("FilterBar", () => {
  it("renders all cause filter chips", () => {
    render(<FilterBar />);
    for (const cause of CAUSES_OF_DEATH) {
      expect(screen.getByText(CAUSE_LABELS[cause])).toBeInTheDocument();
    }
  });

  it("renders all category filter chips", () => {
    render(<FilterBar />);
    for (const cat of TECH_CATEGORIES) {
      expect(screen.getByText(CATEGORY_LABELS[cat])).toBeInTheDocument();
    }
  });

  it("chips have aria-pressed=false by default", () => {
    render(<FilterBar />);
    const buttons = screen.getAllByRole("button", { pressed: false });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("clicking a cause chip toggles it to active", async () => {
    render(<FilterBar />);
    const user = userEvent.setup();

    const chip = screen.getByText("Neglected");
    await user.click(chip);

    expect(chip).toHaveAttribute("aria-pressed", "true");
  });

  it("clicking an active chip toggles it back to inactive", async () => {
    render(<FilterBar />);
    const user = userEvent.setup();

    const chip = screen.getByText("Neglected");
    await user.click(chip);
    await user.click(chip);

    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("shows 'Clear filters' button only when filters are active", async () => {
    render(<FilterBar />);
    expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText("Neglected"));

    expect(screen.getByText("Clear filters")).toBeInTheDocument();
  });

  it("clears all filters when clicking Clear filters", async () => {
    render(<FilterBar />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Neglected"));
    await user.click(screen.getByText("Clear filters"));

    expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
  });

  it("shows total entry count when no filters active", () => {
    render(<FilterBar />);
    expect(screen.getByText(`${entries.length} entries`)).toBeInTheDocument();
  });

  it("shows filtered count when filters active", async () => {
    render(<FilterBar />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Neglected"));

    expect(
      screen.getByText(new RegExp(`Showing \\d+ of ${entries.length} entries`)),
    ).toBeInTheDocument();
  });

  it("has aria-label on the search element", () => {
    const { container } = render(<FilterBar />);
    const searchEl = container.querySelector("search");
    expect(searchEl).toHaveAttribute("aria-label", "Filter entries");
  });
});
