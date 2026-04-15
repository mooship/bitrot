import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useToastStore } from "../../stores/useToastStore";
import { Toast } from "./Toast";

beforeEach(() => {
  useToastStore.setState({ toast: null });
});

describe("Toast", () => {
  it("renders nothing when there is no toast", () => {
    const { container } = render(<Toast />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the toast message when a toast is present", () => {
    useToastStore.setState({ toast: { id: 1, message: "Couldn't pour — please try again." } });
    render(<Toast />);
    expect(screen.getByText("Couldn't pour — please try again.")).toBeInTheDocument();
  });

  it("has role='alert' for immediate screen reader announcement", () => {
    useToastStore.setState({ toast: { id: 1, message: "Error!" } });
    render(<Toast />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("dismiss button clears the toast", async () => {
    useToastStore.setState({ toast: { id: 1, message: "Error!" } });
    render(<Toast />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(useToastStore.getState().toast).toBeNull();
  });
});
