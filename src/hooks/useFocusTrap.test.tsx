import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { useFocusTrap } from "./useFocusTrap";

interface Props {
  active: boolean;
  onEscape?: () => void;
  children?: React.ReactNode;
}

function Trap({ active, onEscape, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active, onEscape });
  return (
    <div ref={ref} data-testid="container">
      {children}
    </div>
  );
}

function Toggle() {
  const [active, setActive] = useState(false);
  return (
    <>
      <button type="button" data-testid="toggle" onClick={() => setActive(true)}>
        activate
      </button>
      <Trap active={active}>
        <button type="button" data-testid="first">
          first
        </button>
        <button type="button" data-testid="last">
          last
        </button>
      </Trap>
    </>
  );
}

describe("useFocusTrap", () => {
  it("does not intercept Tab when inactive", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button" data-testid="outside">
          outside
        </button>
        <Trap active={false}>
          <button type="button" data-testid="first">
            first
          </button>
          <button type="button" data-testid="last">
            last
          </button>
        </Trap>
      </div>
    );

    screen.getByTestId("outside").focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("first"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("last"));
    await user.tab();
    expect(document.activeElement).not.toBe(screen.getByTestId("first"));
  });

  it("wraps Tab forward from last element back to first", async () => {
    const user = userEvent.setup();
    render(
      <Trap active={true}>
        <button type="button" data-testid="first">
          first
        </button>
        <button type="button" data-testid="middle">
          middle
        </button>
        <button type="button" data-testid="last">
          last
        </button>
      </Trap>
    );

    screen.getByTestId("last").focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("first"));
  });

  it("wraps Shift+Tab backward from first element to last", async () => {
    const user = userEvent.setup();
    render(
      <Trap active={true}>
        <button type="button" data-testid="first">
          first
        </button>
        <button type="button" data-testid="last">
          last
        </button>
      </Trap>
    );

    screen.getByTestId("first").focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByTestId("last"));
  });

  it("calls onEscape when Escape key is pressed", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(
      <Trap active={true} onEscape={onEscape}>
        <button type="button">btn</button>
      </Trap>
    );

    screen.getByRole("button").focus();
    await user.keyboard("{Escape}");
    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("does not call onEscape when inactive", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(
      <Trap active={false} onEscape={onEscape}>
        <button type="button">btn</button>
      </Trap>
    );

    screen.getByRole("button").focus();
    await user.keyboard("{Escape}");
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("does not crash when the container has no focusable elements", async () => {
    const user = userEvent.setup();
    render(
      <Trap active={true}>
        <span>no buttons here</span>
      </Trap>
    );

    await expect(user.tab()).resolves.toBeUndefined();
  });

  it("responds to the active prop toggling on", async () => {
    const user = userEvent.setup();
    render(<Toggle />);
    await user.click(screen.getByTestId("toggle"));

    screen.getByTestId("last").focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("first"));
  });
});
