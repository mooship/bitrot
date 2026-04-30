import { screen } from "@testing-library/react";
import { renderWithRouter } from "../../test/fixtures";
import { AboutPage } from "./AboutPage";

describe("AboutPage", () => {
  it("renders the page heading", () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByRole("heading", { name: "About Bitrot" })).toBeInTheDocument();
  });

  it("renders a back link to the home page", () => {
    renderWithRouter(<AboutPage />);
    const backLink = screen.getByRole("link", { name: /back to home/i });
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("renders the Missing something section", () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByRole("heading", { name: "Missing something?" })).toBeInTheDocument();
  });

  it("renders the Built by section", () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByRole("heading", { name: "Built by" })).toBeInTheDocument();
  });

  it("renders the Open source section", () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByRole("heading", { name: "Open source" })).toBeInTheDocument();
  });

  it("external links open in a new tab with safe rel attributes", () => {
    renderWithRouter(<AboutPage />);
    const externalLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("https://"));

    expect(externalLinks.length).toBeGreaterThan(0);
    for (const link of externalLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
