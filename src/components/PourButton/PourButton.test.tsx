import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePourStore } from "../../stores/usePourStore";
import { PourButton } from "./PourButton";

vi.mock("../../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock("../../api/pours", () => ({
  fetchAllPours: vi.fn().mockResolvedValue({}),
  incrementPour: vi.fn().mockResolvedValue(1),
}));

beforeEach(() => {
  usePourStore.setState({
    counts: { vine: 10 },
    globalCount: 10,
    pouredThisSession: new Set(),
    loading: false,
  });
});

describe("PourButton", () => {
  it("shows 'Pour one out' label initially", () => {
    render(<PourButton entryId="vine" entryName="Vine" />);
    expect(screen.getByText("Pour one out")).toBeInTheDocument();
  });

  it("displays the current pour count", () => {
    render(<PourButton entryId="vine" entryName="Vine" />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("shows plural 'pours' for count > 1", () => {
    render(<PourButton entryId="vine" entryName="Vine" />);
    expect(screen.getByText("pours")).toBeInTheDocument();
  });

  it("shows singular 'pour' for count of 1", () => {
    usePourStore.setState({ counts: { vine: 1 } });
    render(<PourButton entryId="vine" entryName="Vine" />);
    expect(screen.getByText("pour")).toBeInTheDocument();
  });

  it("shows 'Poured' and is disabled after pouring", () => {
    usePourStore.setState({ pouredThisSession: new Set(["vine"]) });
    render(<PourButton entryId="vine" entryName="Vine" />);
    expect(screen.getByText("Poured")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("has an accessible aria-label with entry name and count", () => {
    render(<PourButton entryId="vine" entryName="Vine" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Pour one out for Vine. Current count: 10");
  });

  it("calls pour on click", async () => {
    const user = userEvent.setup();
    render(<PourButton entryId="vine" entryName="Vine" />);

    await user.click(screen.getByRole("button"));

    expect(usePourStore.getState().pouredThisSession.has("vine")).toBe(true);
  });
});
