import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { usePourStore } from "./stores/usePourStore";

vi.mock("./api/pours", () => ({
  fetchAllPours: vi.fn().mockResolvedValue({}),
  incrementPour: vi.fn().mockResolvedValue(1),
}));

vi.mock("./hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

import App from "./App";

function renderApp(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>
  );
}

beforeEach(() => {
  usePourStore.setState({
    counts: {},
    globalCount: 0,
    pouredThisSession: new Set(),
    loading: false,
  });
});

describe("App", () => {
  it("renders the skip link", () => {
    renderApp();
    expect(screen.getByRole("link", { name: "Skip to content" })).toBeInTheDocument();
  });

  it("renders the header with title", () => {
    renderApp();
    expect(screen.getByRole("heading", { name: "Bitrot" })).toBeInTheDocument();
  });

  it("renders the filter bar", () => {
    const { container } = renderApp();
    const searchEl = container.querySelector("search");
    expect(searchEl).toBeInTheDocument();
  });

  it("renders the timeline", () => {
    renderApp();
    expect(screen.getByRole("region", { name: "Timeline of dead technology" })).toBeInTheDocument();
  });

  it("renders the footer", () => {
    renderApp();
    expect(screen.getByText(/In memory of the products we actually used/)).toBeInTheDocument();
  });

  it("does not render EntryDetail when no hash route is active", () => {
    renderApp();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
