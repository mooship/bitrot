import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useThemeStore } from "../../stores/useThemeStore";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("shows 'Switch to light theme' when in dark mode", () => {
    useThemeStore.setState({ theme: "dark" });
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });

  it("shows 'Switch to dark theme' when in light mode", () => {
    useThemeStore.setState({ theme: "light" });
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });

  it("toggles theme on click", async () => {
    useThemeStore.setState({ theme: "dark" });
    render(<ThemeToggle />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));

    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("renders a button element", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
