import { fireEvent, type RenderOptions, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import type { DeadTech } from "../../data/types";
import { useFilterStore } from "../../stores/useFilterStore";
import { mockEntry, mockEntryMinimal, resetFilterStore } from "../../test/fixtures";
import { EntryDetail } from "./EntryDetail";

vi.mock("../../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock("../../api/pours", () => ({
  fetchAllPours: vi.fn().mockResolvedValue({}),
  incrementPour: vi.fn().mockResolvedValue(1),
}));

function renderWithRouter(ui: ReactElement, options?: RenderOptions) {
  return render(<MemoryRouter>{ui}</MemoryRouter>, options);
}

beforeEach(() => {
  resetFilterStore();
});

describe("EntryDetail", () => {
  it("returns null when entry is null", () => {
    const { container } = renderWithRouter(<EntryDetail entry={null} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a dialog with correct role and aria-modal", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders entry name as heading", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Google Reader" })).toBeInTheDocument();
  });

  it("renders tagline", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("The RSS reader that united the internet")).toBeInTheDocument();
  });

  it("renders autopsy text", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(
      screen.getByText(/Google killed it because they wanted everyone on Google\+/)
    ).toBeInTheDocument();
  });

  it("renders dates and lifespan", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText(/2005–2013 · 8 years/)).toBeInTheDocument();
  });

  it("renders cause of death badge", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Neglected")).toBeInTheDocument();
  });

  it("renders category label", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Software")).toBeInTheDocument();
  });

  it("renders parent company when present", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("renders killedBy when present", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Google+")).toBeInTheDocument();
  });

  it("renders peak info when present", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText(/2012/)).toBeInTheDocument();
    expect(screen.getByText(/24M users/)).toBeInTheDocument();
  });

  it("does not render optional fields when absent", () => {
    renderWithRouter(<EntryDetail entry={mockEntryMinimal} onClose={vi.fn()} />);
    expect(screen.queryByText("Parent")).not.toBeInTheDocument();
    expect(screen.queryByText("Killed by")).not.toBeInTheDocument();
    expect(screen.queryByText("Peak")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={onClose} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /^Close / }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const { container } = renderWithRouter(<EntryDetail entry={mockEntry} onClose={onClose} />);
    const user = userEvent.setup();

    const backdrop = container.firstChild as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={onClose} />);
    const user = userEvent.setup();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  describe("copy link (clipboard fallback)", () => {
    let writeTextSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      writeTextSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: writeTextSpy },
        writable: true,
        configurable: true,
      });
      // Ensure Share API is not available so the clipboard path is exercised
      Object.defineProperty(navigator, "share", {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });

    it("copies link to clipboard when copy button is clicked", async () => {
      renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: "Copy link to this entry" }));

      await vi.waitFor(() => {
        expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining("#/entry/google-reader"));
      });
    });

    it("shows 'Copied!' after clicking copy", async () => {
      renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: "Copy link to this entry" }));

      await vi.waitFor(() => {
        expect(screen.getByText("Copied!")).toBeInTheDocument();
      });
    });
  });

  describe("share button (Web Share API)", () => {
    let shareSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      shareSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "share", {
        value: shareSpy,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(navigator, "share", {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });

    it("shows 'Share' label when navigator.share is available", () => {
      renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Share this entry" })).toBeInTheDocument();
      expect(screen.getByText("Share")).toBeInTheDocument();
    });

    it("calls navigator.share with correct data when clicked", async () => {
      renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: "Share this entry" }));

      await vi.waitFor(() => {
        expect(shareSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Google Reader",
            url: expect.stringContaining("#/entry/google-reader"),
          })
        );
      });
    });

    it("does not throw when navigator.share rejects (user cancelled)", async () => {
      shareSpy.mockRejectedValue(new DOMException("Share cancelled", "AbortError"));
      renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: "Share this entry" }));

      await vi.waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });

  it("sets document.title to entry name", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(document.title).toBe("Google Reader — Bitrot");
  });

  it("resets document.title when entry is null", () => {
    const { rerender } = renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    rerender(
      <MemoryRouter>
        <EntryDetail entry={null} onClose={vi.fn()} />
      </MemoryRouter>
    );
    expect(document.title).toBe("Bitrot — Dead Tech Memorial");
  });

  it("renders PourButton with correct entry name", () => {
    renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(
      screen.getByRole("button", {
        name: /Pour one out for Google Reader/,
      })
    ).toBeInTheDocument();
  });

  it("renders lifespan with singular 'year' for 1-year lifespan", () => {
    const shortLivedEntry: DeadTech = {
      ...mockEntryMinimal,
      born: 2014,
      died: 2015,
    };
    renderWithRouter(<EntryDetail entry={shortLivedEntry} onClose={vi.fn()} />);
    expect(screen.getByText(/1 year/)).toBeInTheDocument();
  });

  describe("cross-links (parent / killedBy)", () => {
    it("renders parent as a clickable button", () => {
      renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
      expect(
        screen.getByRole("button", { name: "Show entries related to Google" })
      ).toBeInTheDocument();
    });

    it("renders killedBy as a clickable button", () => {
      renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
      expect(
        screen.getByRole("button", { name: "Show entries related to Google+" })
      ).toBeInTheDocument();
    });

    it("clicking parent sets search query and closes modal", async () => {
      const onClose = vi.fn();
      renderWithRouter(<EntryDetail entry={mockEntry} onClose={onClose} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Show entries related to Google" }));

      expect(useFilterStore.getState().searchQuery).toBe("Google");
      expect(onClose).toHaveBeenCalled();
    });

    it("clicking killedBy clears existing cause/category filters", async () => {
      useFilterStore.setState({
        activeCauses: new Set(["hubris"]),
        activeCategories: new Set(["social"]),
        searchQuery: "",
      });
      renderWithRouter(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Show entries related to Google+" }));

      const state = useFilterStore.getState();
      expect(state.activeCauses.size).toBe(0);
      expect(state.activeCategories.size).toBe(0);
      expect(state.searchQuery).toBe("Google+");
    });

    it("strips parenthetical context from cross-link search term", async () => {
      const entryWithParenthetical: DeadTech = {
        ...mockEntry,
        killedBy: "Google+ (indirectly — resources redirected)",
      };
      renderWithRouter(<EntryDetail entry={entryWithParenthetical} onClose={vi.fn()} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "Show entries related to Google+" }));

      expect(useFilterStore.getState().searchQuery).toBe("Google+");
    });
  });
});
