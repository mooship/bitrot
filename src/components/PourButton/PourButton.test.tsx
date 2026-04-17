import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePourStore } from "../../stores/usePourStore";
import { PourButton } from "./PourButton";

vi.mock("../../api/pours", () => ({
  fetchAllPours: vi.fn().mockResolvedValue({}),
  incrementPour: vi.fn().mockResolvedValue(1),
}));

beforeEach(() => {
  usePourStore.setState({
    counts: { vine: 10 },
    globalCount: 10,
    pouredThisSession: new Set(),
    pendingPours: new Set(),
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

  it("hides count when zero", () => {
    usePourStore.setState({ counts: {} });
    render(<PourButton entryId="vine" entryName="Vine" />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
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

  it("shows a placeholder dash while counts are loading", () => {
    usePourStore.setState({ counts: {}, loading: true });
    render(<PourButton entryId="vine" entryName="Vine" />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("does not show the placeholder once the count has hydrated", () => {
    usePourStore.setState({ counts: { vine: 0 }, loading: true });
    render(<PourButton entryId="vine" entryName="Vine" />);
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });
});
