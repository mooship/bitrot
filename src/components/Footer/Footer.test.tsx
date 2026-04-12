import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the memorial text", () => {
    render(<Footer />);
    expect(
      screen.getByText(/In memory of the products we actually used/),
    ).toBeInTheDocument();
  });

  it("renders the pour tagline", () => {
    render(<Footer />);
    expect(
      screen.getByText(/No flowers\. Just one more pour\./),
    ).toBeInTheDocument();
  });

  it("renders a footer element", () => {
    render(<Footer />);
    expect(document.querySelector("footer")).toBeInTheDocument();
  });
});
