import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DeadTech } from "../../data/types";
import { EntryDetail } from "./EntryDetail";

vi.mock("../../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock("../../api/pours", () => ({
  fetchAllPours: vi.fn().mockResolvedValue({}),
  incrementPour: vi.fn().mockResolvedValue(1),
}));

const mockEntry: DeadTech = {
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

const mockEntryMinimal: DeadTech = {
  id: "test-entry",
  name: "Test Entry",
  tagline: "A minimal test entry",
  born: 2010,
  died: 2015,
  causeOfDeath: "hubris",
  autopsy: "It failed spectacularly.",
  category: "other",
};

describe("EntryDetail", () => {
  it("returns null when entry is null", () => {
    const { container } = render(<EntryDetail entry={null} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a dialog with correct role and aria-modal", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders entry name as heading", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Google Reader" })).toBeInTheDocument();
  });

  it("renders tagline", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("The RSS reader that united the internet")).toBeInTheDocument();
  });

  it("renders autopsy text", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(
      screen.getByText(/Google killed it because they wanted everyone on Google\+/)
    ).toBeInTheDocument();
  });

  it("renders dates and lifespan", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText(/2005–2013 · 8 years/)).toBeInTheDocument();
  });

  it("renders cause of death badge", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Neglected")).toBeInTheDocument();
  });

  it("renders category label", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Software")).toBeInTheDocument();
  });

  it("renders parent company when present", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("renders killedBy when present", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText("Google+")).toBeInTheDocument();
  });

  it("renders peak info when present", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(screen.getByText(/2012/)).toBeInTheDocument();
    expect(screen.getByText(/24M users/)).toBeInTheDocument();
  });

  it("does not render optional fields when absent", () => {
    render(<EntryDetail entry={mockEntryMinimal} onClose={vi.fn()} />);
    expect(screen.queryByText("Parent")).not.toBeInTheDocument();
    expect(screen.queryByText("Killed by")).not.toBeInTheDocument();
    expect(screen.queryByText("Peak")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<EntryDetail entry={mockEntry} onClose={onClose} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(<EntryDetail entry={mockEntry} onClose={onClose} />);
    const user = userEvent.setup();

    const backdrop = container.firstChild as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    render(<EntryDetail entry={mockEntry} onClose={onClose} />);
    const user = userEvent.setup();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("copies link to clipboard when copy button is clicked", async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    });

    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link to this entry" }));

    await vi.waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining("#/entry/google-reader"));
    });
  });

  it("shows 'Copied!' after clicking copy", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });

    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link to this entry" }));

    await vi.waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("sets document.title to entry name", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    expect(document.title).toBe("Google Reader — Bitrot");
  });

  it("resets document.title when entry is null", () => {
    const { rerender } = render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
    rerender(<EntryDetail entry={null} onClose={vi.fn()} />);
    expect(document.title).toBe("Bitrot — Dead Tech Memorial");
  });

  it("renders PourButton with correct entry name", () => {
    render(<EntryDetail entry={mockEntry} onClose={vi.fn()} />);
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
    render(<EntryDetail entry={shortLivedEntry} onClose={vi.fn()} />);
    expect(screen.getByText(/1 year/)).toBeInTheDocument();
  });
});
