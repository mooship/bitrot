import { render, screen } from "@testing-library/react";
import { YearMarker } from "./YearMarker";

describe("YearMarker", () => {
  it("renders the year as text", () => {
    render(<YearMarker year={2013} />);
    expect(screen.getByText("2013")).toBeInTheDocument();
  });

  it("is marked as aria-hidden (decorative)", () => {
    const { container } = render(<YearMarker year={2020} />);
    const li = container.querySelector("li");
    expect(li).toHaveAttribute("aria-hidden", "true");
  });
});
