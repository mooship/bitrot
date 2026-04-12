import { render, screen } from "@testing-library/react";
import { SkipLink } from "./SkipLink";

describe("SkipLink", () => {
  it("renders a link with correct text", () => {
    render(<SkipLink />);
    expect(screen.getByText("Skip to content")).toBeInTheDocument();
  });

  it("links to #main-content", () => {
    render(<SkipLink />);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content"
    );
  });
});
