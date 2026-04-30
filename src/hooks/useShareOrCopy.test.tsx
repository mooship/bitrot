import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useShareOrCopy } from "./useShareOrCopy";

function ShareButton() {
  const { canShare, copyState, share } = useShareOrCopy();
  return (
    <button
      type="button"
      onClick={() => share({ url: "https://example.com", title: "Test", text: "body" })}
    >
      {canShare ? "share" : `copy:${copyState}`}
    </button>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "share", {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

describe("useShareOrCopy — share API available", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });
  });

  it("reports canShare as true", () => {
    render(<ShareButton />);
    expect(screen.getByRole("button")).toHaveTextContent("share");
  });

  it("calls navigator.share with the provided data", async () => {
    const user = userEvent.setup();
    render(<ShareButton />);
    await user.click(screen.getByRole("button"));
    expect(navigator.share).toHaveBeenCalledWith({
      url: "https://example.com",
      title: "Test",
      text: "body",
    });
  });

  it("does not surface an error when share is rejected (user cancel)", async () => {
    vi.mocked(navigator.share).mockRejectedValue(new DOMException("cancelled", "AbortError"));
    const user = userEvent.setup();
    render(<ShareButton />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("share");
  });
});

describe("useShareOrCopy — share API unavailable", () => {
  it("reports canShare as false", () => {
    render(<ShareButton />);
    expect(screen.getByRole("button")).toHaveTextContent("copy:idle");
  });

  it("copies the url to clipboard on share()", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<ShareButton />);
    fireEvent.click(screen.getByRole("button"));
    await act(async () => {});
    expect(writeText).toHaveBeenCalledWith("https://example.com");
  });

  it("sets copyState to 'copied' after successful clipboard write", async () => {
    render(<ShareButton />);
    fireEvent.click(screen.getByRole("button"));
    await act(async () => {});
    expect(screen.getByRole("button")).toHaveTextContent("copy:copied");
  });

  it("sets copyState back to 'idle' after the reset timeout", async () => {
    vi.useFakeTimers();
    render(<ShareButton />);
    fireEvent.click(screen.getByRole("button"));
    await act(async () => {});
    expect(screen.getByRole("button")).toHaveTextContent("copy:copied");
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByRole("button")).toHaveTextContent("copy:idle");
    vi.useRealTimers();
  });

  it("sets copyState to 'error' when clipboard write fails", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    render(<ShareButton />);
    fireEvent.click(screen.getByRole("button"));
    await act(async () => {});
    expect(screen.getByRole("button")).toHaveTextContent("copy:error");
  });
});
