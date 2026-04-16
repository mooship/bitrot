import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DeadTech } from "../../data/types";
import { useFilterStore } from "../../stores/useFilterStore";
import { resetFilterStore } from "../../test/fixtures";
import { Timeline } from "./Timeline";

vi.mock("../../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

const mockEntries: DeadTech[] = [
  {
    id: "entry-a",
    name: "Entry A",
    tagline: "First entry",
    born: 2010,
    died: 2020,
    causeOfDeath: "neglected",
    autopsy: "Gone.",
    category: "software",
  },
  {
    id: "entry-b",
    name: "Entry B",
    tagline: "Second entry",
    born: 2005,
    died: 2020,
    causeOfDeath: "hubris",
    autopsy: "Also gone.",
    category: "hardware",
  },
  {
    id: "entry-c",
    name: "Entry C",
    tagline: "Third entry",
    born: 2000,
    died: 2015,
    causeOfDeath: "outcompeted",
    autopsy: "Lost.",
    category: "social",
  },
];

beforeEach(() => {
  resetFilterStore();
});

describe("Timeline", () => {
  it("renders entries grouped by death year", () => {
    render(<Timeline entries={mockEntries} sortOrder="died" onSelect={vi.fn()} />);
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText("2015")).toBeInTheDocument();
  });

  it("renders entry cards for each entry", () => {
    render(<Timeline entries={mockEntries} sortOrder="died" onSelect={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Entry A" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Entry B" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Entry C" })).toBeInTheDocument();
  });

  it("shows empty state when entries is empty", () => {
    render(<Timeline entries={[]} sortOrder="died" onSelect={vi.fn()} />);
    expect(screen.getByText("No tomb matches these filters.")).toBeInTheDocument();
  });

  it("has aria-label on the section", () => {
    render(<Timeline entries={mockEntries} sortOrder="died" onSelect={vi.fn()} />);
    expect(screen.getByRole("region", { name: "Timeline of dead technology" })).toBeInTheDocument();
  });

  it("does not show empty state when entries exist", () => {
    render(<Timeline entries={mockEntries} sortOrder="died" onSelect={vi.fn()} />);
    expect(screen.queryByText("No tomb matches these filters.")).not.toBeInTheDocument();
  });

  it("empty state 'Clear filters' button resets the filter store", async () => {
    useFilterStore.getState().toggleCause("neglected");
    useFilterStore.getState().setSearchQuery("nothing matches");

    render(<Timeline entries={[]} sortOrder="died" onSelect={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    const state = useFilterStore.getState();
    expect(state.activeCauses.size).toBe(0);
    expect(state.searchQuery).toBe("");
  });
});
