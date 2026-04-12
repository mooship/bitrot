import { render, screen } from "@testing-library/react";
import { usePourStore } from "./stores/usePourStore";

vi.mock("./api/pours", () => ({
  fetchAllPours: vi.fn().mockResolvedValue({}),
  incrementPour: vi.fn().mockResolvedValue(1),
}));

vi.mock("./hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

import App from "./App";

beforeEach(() => {
  usePourStore.setState({
    counts: {},
    globalCount: 0,
    pouredThisSession: new Set(),
    loading: false,
  });
  history.pushState(null, "", window.location.pathname);
});

describe("App", () => {
  it("renders the skip link", () => {
    render(<App />);
    expect(
      screen.getByRole("link", { name: "Skip to content" }),
    ).toBeInTheDocument();
  });

  it("renders the header with title", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Bitrot" })).toBeInTheDocument();
  });

  it("renders the filter bar", () => {
    const { container } = render(<App />);
    const searchEl = container.querySelector("search");
    expect(searchEl).toBeInTheDocument();
  });

  it("renders the timeline", () => {
    render(<App />);
    expect(
      screen.getByRole("region", { name: "Timeline of dead technology" }),
    ).toBeInTheDocument();
  });

  it("renders the footer", () => {
    render(<App />);
    expect(
      screen.getByText(/In memory of the products we actually used/),
    ).toBeInTheDocument();
  });

  it("does not render EntryDetail when no hash route is active", () => {
    render(<App />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
