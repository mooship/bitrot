import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../../test/fixtures";
import { ShortcutHelp } from "./ShortcutHelp";

describe("ShortcutHelp", () => {
  it("does not render anything until opened", () => {
    renderWithRouter(<ShortcutHelp />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens when ? is pressed", async () => {
    renderWithRouter(<ShortcutHelp />);
    const user = userEvent.setup();
    await user.keyboard("?");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Keyboard shortcuts" })).toBeInTheDocument();
  });

  it("closes when Esc is pressed", async () => {
    renderWithRouter(<ShortcutHelp />);
    const user = userEvent.setup();
    await user.keyboard("?");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the close button is clicked", async () => {
    renderWithRouter(<ShortcutHelp />);
    const user = userEvent.setup();
    await user.keyboard("?");
    await user.click(screen.getByRole("button", { name: "Close keyboard shortcuts" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not open when ? is typed inside an input", async () => {
    renderWithRouter(
      <>
        <input aria-label="test input" />
        <ShortcutHelp />
      </>
    );
    const user = userEvent.setup();
    const input = screen.getByLabelText("test input");
    await user.click(input);
    await user.keyboard("?");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lists the main shortcuts", async () => {
    renderWithRouter(<ShortcutHelp />);
    const user = userEvent.setup();
    await user.keyboard("?");
    expect(screen.getByText("Focus the search field")).toBeInTheDocument();
    expect(screen.getByText(/Previous . next obituary/)).toBeInTheDocument();
    expect(screen.getByText("Open a random obituary")).toBeInTheDocument();
    expect(screen.getByText("Clear filters or close dialogs")).toBeInTheDocument();
  });
});
