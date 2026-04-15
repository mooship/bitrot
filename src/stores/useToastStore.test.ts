import { useToastStore } from "./useToastStore";

beforeEach(() => {
  useToastStore.setState({ toast: null });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useToastStore", () => {
  it("show sets a toast with the given message", () => {
    useToastStore.getState().show("Something went wrong");
    expect(useToastStore.getState().toast?.message).toBe("Something went wrong");
  });

  it("dismiss clears the toast", () => {
    useToastStore.getState().show("Hello");
    useToastStore.getState().dismiss();
    expect(useToastStore.getState().toast).toBeNull();
  });

  it("auto-dismisses after 4 seconds", () => {
    useToastStore.getState().show("Auto gone");
    expect(useToastStore.getState().toast).not.toBeNull();

    vi.advanceTimersByTime(4000);
    expect(useToastStore.getState().toast).toBeNull();
  });

  it("does not auto-dismiss before 4 seconds", () => {
    useToastStore.getState().show("Still here");
    vi.advanceTimersByTime(3999);
    expect(useToastStore.getState().toast).not.toBeNull();
  });

  it("second show replaces the first toast", () => {
    useToastStore.getState().show("First");
    useToastStore.getState().show("Second");
    expect(useToastStore.getState().toast?.message).toBe("Second");
  });

  it("stale auto-dismiss does not clear a newer toast", () => {
    useToastStore.getState().show("First");
    vi.advanceTimersByTime(2000);
    useToastStore.getState().show("Second");
    vi.advanceTimersByTime(2001);
    expect(useToastStore.getState().toast?.message).toBe("Second");
  });
});
