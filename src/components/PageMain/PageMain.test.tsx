import { render, screen } from "@testing-library/react";
import { PageMain } from "./PageMain";

describe("PageMain", () => {
  it("renders a <main> element", () => {
    render(<PageMain>content</PageMain>);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("has id='main-content' as the skip-link target", () => {
    render(<PageMain>content</PageMain>);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("renders children inside the main element", () => {
    render(
      <PageMain>
        <p>hello world</p>
      </PageMain>
    );
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });
});
