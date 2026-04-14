import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { usePourStore } from "../../stores/usePourStore";
import { Header } from "./Header";

vi.mock("../../api/pours", () => ({
  fetchAllPours: vi.fn().mockResolvedValue({}),
  incrementPour: vi.fn().mockResolvedValue(0),
}));

beforeEach(() => {
  usePourStore.setState({
    counts: {},
    globalCount: 0,
    pouredThisSession: new Set(),
    loading: false,
  });
});

describe("Header", () => {
  it("renders the title", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Bitrot" })).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText("An interactive memorial for dead technology")).toBeInTheDocument();
  });

  it("does not show count when globalCount is 0", () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.queryByText(/moment/)).not.toBeInTheDocument();
  });

  it("shows singular form for count of 1", () => {
    usePourStore.setState({ globalCount: 1 });
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText(/moment of silence/)).toBeInTheDocument();
  });

  it("shows plural form for count greater than 1", () => {
    usePourStore.setState({ globalCount: 42 });
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText(/moments of silence/)).toBeInTheDocument();
  });
});
