import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockEntry, mockEntryMinimal } from "../../test/fixtures";
import { EntryCard } from "./EntryCard";

vi.mock("../../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

describe("EntryCard", () => {
  it("renders entry name", () => {
    render(<EntryCard entry={mockEntry} onSelect={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Google Reader" })).toBeInTheDocument();
  });

  it("renders tagline", () => {
    render(<EntryCard entry={mockEntry} onSelect={vi.fn()} />);
    expect(screen.getByText("The RSS reader that united the internet")).toBeInTheDocument();
  });

  it("renders birth and death dates", () => {
    render(<EntryCard entry={mockEntry} onSelect={vi.fn()} />);
    expect(screen.getByText("2005–2013")).toBeInTheDocument();
  });

  it("renders lifespan", () => {
    render(<EntryCard entry={mockEntry} onSelect={vi.fn()} />);
    expect(screen.getByText("8y")).toBeInTheDocument();
  });

  it("renders cause of death badge", () => {
    render(<EntryCard entry={mockEntry} onSelect={vi.fn()} />);
    expect(screen.getByText("Neglected")).toBeInTheDocument();
  });

  it("renders parent company when present", () => {
    render(<EntryCard entry={mockEntry} onSelect={vi.fn()} />);
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("does not render parent when absent", () => {
    render(<EntryCard entry={mockEntryMinimal} onSelect={vi.fn()} />);
    expect(screen.queryByText("Google")).not.toBeInTheDocument();
  });

  it("calls onSelect with entry id on click", async () => {
    const onSelect = vi.fn();
    render(<EntryCard entry={mockEntry} onSelect={onSelect} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith("google-reader");
  });

  it("has an accessible aria-label on the button", () => {
    render(<EntryCard entry={mockEntry} onSelect={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", expect.stringContaining("Google Reader"));
    expect(button).toHaveAttribute("aria-label", expect.stringContaining("Neglected"));
  });

  it("applies accent color CSS variable when brandColor is present", () => {
    const { container } = render(<EntryCard entry={mockEntry} onSelect={vi.fn()} />);
    const article = container.querySelector("article");
    expect(article?.style.getPropertyValue("--entry-accent")).toBeTruthy();
  });

  it("does not apply accent color when brandColor is absent", () => {
    const { container } = render(<EntryCard entry={mockEntryMinimal} onSelect={vi.fn()} />);
    const article = container.querySelector("article");
    expect(article?.style.getPropertyValue("--entry-accent")).toBe("");
  });
});
