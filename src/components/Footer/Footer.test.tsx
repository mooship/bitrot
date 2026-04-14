import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the memorial text", () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByText(/In memory of the products we actually used/)).toBeInTheDocument();
  });

  it("renders the pour tagline", () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByText(/No flowers\. Just one more pour\./)).toBeInTheDocument();
  });

  it("renders a footer element", () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(document.querySelector("footer")).toBeInTheDocument();
  });
});
