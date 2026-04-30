import { render, screen } from "@testing-library/react";
import { useThemeStore } from "../stores/useThemeStore";
import { useEntryAccent } from "./useEntryAccent";

function AccentDiv({ brandColor }: { brandColor?: string }) {
  const style = useEntryAccent(brandColor);
  return (
    <div data-testid="target" style={style}>
      content
    </div>
  );
}

beforeEach(() => {
  useThemeStore.setState({ theme: "dark" });
});

describe("useEntryAccent", () => {
  it("returns undefined style when brandColor is undefined", () => {
    render(<AccentDiv />);
    const el = screen.getByTestId("target");
    expect(el.getAttribute("style")).toBeNull();
  });

  it("sets --entry-accent CSS variable when brandColor is provided", () => {
    render(<AccentDiv brandColor="#4285F4" />);
    const el = screen.getByTestId("target");
    expect(el.getAttribute("style")).toContain("--entry-accent");
  });

  it("produces a different --entry-accent value in light theme vs dark theme", () => {
    const { rerender } = render(<AccentDiv brandColor="#4285F4" />);
    const darkStyle = screen.getByTestId("target").getAttribute("style");

    useThemeStore.setState({ theme: "light" });
    rerender(<AccentDiv brandColor="#4285F4" />);
    const lightStyle = screen.getByTestId("target").getAttribute("style");

    expect(darkStyle).not.toBe(lightStyle);
  });
});
