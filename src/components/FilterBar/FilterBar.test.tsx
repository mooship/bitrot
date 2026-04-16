import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { entries } from "../../data/entries";
import { CATEGORY_LABELS, CAUSE_LABELS, CAUSES_OF_DEATH, TECH_CATEGORIES } from "../../data/types";
import { useFilterStore } from "../../stores/useFilterStore";
import { resetFilterStore } from "../../test/fixtures";
import { FilterBar } from "./FilterBar";

beforeEach(() => {
  resetFilterStore();
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
      screen.getByText(new RegExp(`Showing \\d+ of ${entries.length} entries`))
    ).toBeInTheDocument();
  });

  it("has aria-label on the search element", () => {
    const { container } = render(<FilterBar />);
    const searchEl = container.querySelector("search");
    expect(searchEl).toHaveAttribute("aria-label", "Filter entries");
  });

  describe("search input", () => {
    it("renders a search input with placeholder", () => {
      render(<FilterBar />);
      expect(screen.getByPlaceholderText(/search dead tech/i)).toBeInTheDocument();
    });

    it("typing updates the store and filters the count", async () => {
      render(<FilterBar />);
      const user = userEvent.setup();

      const input = screen.getByPlaceholderText(/search dead tech/i);
      await user.type(input, "google reader");

      expect(useFilterStore.getState().searchQuery).toBe("google reader");
      expect(
        screen.getByText(new RegExp(`Showing \\d+ of ${entries.length} entries`))
      ).toBeInTheDocument();
    });

    it("shows clear button only when query is non-empty", async () => {
      render(<FilterBar />);
      const user = userEvent.setup();

      expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();

      const input = screen.getByPlaceholderText(/search dead tech/i);
      await user.type(input, "x");

      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
    });

    it("clear button empties the query", async () => {
      render(<FilterBar />);
      const user = userEvent.setup();

      const input = screen.getByPlaceholderText(/search dead tech/i);
      await user.type(input, "google");
      await user.click(screen.getByLabelText("Clear search"));

      expect(useFilterStore.getState().searchQuery).toBe("");
      expect(input).toHaveValue("");
    });

    it("Clear filters also clears the search query", async () => {
      render(<FilterBar />);
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText(/search dead tech/i), "google");
      await user.click(screen.getByText("Clear filters"));

      expect(useFilterStore.getState().searchQuery).toBe("");
    });

    it("search query alone shows 'Clear filters' button", async () => {
      render(<FilterBar />);
      const user = userEvent.setup();

      expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
      await user.type(screen.getByPlaceholderText(/search dead tech/i), "google");
      expect(screen.getByText("Clear filters")).toBeInTheDocument();
    });
  });

  describe("Escape keyboard shortcut", () => {
    it("clears filters when Escape is pressed on the document body", async () => {
      render(<FilterBar />);
      const user = userEvent.setup();

      await user.click(screen.getByText("Neglected"));
      expect(useFilterStore.getState().activeCauses.has("neglected")).toBe(true);

      await user.keyboard("{Escape}");

      expect(useFilterStore.getState().activeCauses.size).toBe(0);
      expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
    });

    it("clears filters from inside the search input", async () => {
      render(<FilterBar />);
      const user = userEvent.setup();

      const input = screen.getByPlaceholderText(/search dead tech/i);
      await user.type(input, "google");
      expect(useFilterStore.getState().searchQuery).toBe("google");

      input.focus();
      await user.keyboard("{Escape}");

      expect(useFilterStore.getState().searchQuery).toBe("");
    });

    it("is a no-op when no filters are active", async () => {
      render(<FilterBar />);
      const user = userEvent.setup();

      await user.keyboard("{Escape}");

      expect(useFilterStore.getState().activeCauses.size).toBe(0);
      expect(useFilterStore.getState().searchQuery).toBe("");
    });

    it("does not clear filters when target is inside a dialog", async () => {
      useFilterStore.getState().toggleCause("neglected");

      const dialog = document.createElement("div");
      dialog.setAttribute("role", "dialog");
      const inner = document.createElement("button");
      dialog.appendChild(inner);
      document.body.appendChild(dialog);

      try {
        render(<FilterBar />);
        inner.focus();

        const user = userEvent.setup();
        await user.keyboard("{Escape}");

        expect(useFilterStore.getState().activeCauses.has("neglected")).toBe(true);
      } finally {
        dialog.remove();
      }
    });
  });
});
