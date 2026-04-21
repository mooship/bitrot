import { screen } from "@testing-library/react";
import { entries } from "../../data/entries";
import { renderWithRouter } from "../../test/fixtures";
import { Graveyard } from "./Graveyard";

describe("Graveyard", () => {
  it("renders an accessible SVG figure", () => {
    renderWithRouter(<Graveyard />);
    const svg = screen.getByRole("img");
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg).toHaveAttribute(
      "aria-label",
      expect.stringContaining(`${entries.length} dead technologies`)
    );
  });

  it("renders one line segment per entry", () => {
    const { container } = renderWithRouter(<Graveyard />);
    const lifespanLines = container.querySelectorAll("line[stroke-linecap='round']");
    expect(lifespanLines.length).toBe(entries.length);
  });

  it("renders a <title> for each entry with name and years", () => {
    const { container } = renderWithRouter(<Graveyard />);
    const firstTitle = container.querySelector("a[class*='row'] title");
    expect(firstTitle?.textContent ?? "").toMatch(/\d{4}–\d{4}/);
  });
});
