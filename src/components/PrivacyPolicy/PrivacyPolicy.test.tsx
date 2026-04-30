import { screen } from "@testing-library/react";
import { renderWithRouter } from "../../test/fixtures";
import { PrivacyPolicy } from "./PrivacyPolicy";

describe("PrivacyPolicy", () => {
  it("renders the page heading", () => {
    renderWithRouter(<PrivacyPolicy />);
    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
  });

  it("renders a back link to the home page", () => {
    renderWithRouter(<PrivacyPolicy />);
    const backLink = screen.getByRole("link", { name: /back to home/i });
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("renders all five section headings", () => {
    renderWithRouter(<PrivacyPolicy />);
    expect(screen.getByRole("heading", { name: "What we collect" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Data collected by Cloudflare" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cookies" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Third parties" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Changes to this policy" })).toBeInTheDocument();
  });

  it("external links open in a new tab with safe rel attributes", () => {
    renderWithRouter(<PrivacyPolicy />);
    const externalLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("https://"));

    expect(externalLinks.length).toBeGreaterThan(0);
    for (const link of externalLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders the Cloudflare Analytics link", () => {
    renderWithRouter(<PrivacyPolicy />);
    expect(screen.getByRole("link", { name: /cloudflare web analytics/i })).toBeInTheDocument();
  });
});
