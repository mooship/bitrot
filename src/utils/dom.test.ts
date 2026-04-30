import { isEditableTarget, isInDialog } from "./dom";

describe("isEditableTarget", () => {
  it("returns false for null", () => {
    expect(isEditableTarget(null)).toBe(false);
  });

  it("returns false for non-HTMLElement event target", () => {
    expect(isEditableTarget(new EventTarget())).toBe(false);
  });

  it("returns true for an INPUT element", () => {
    const input = document.createElement("input");
    expect(isEditableTarget(input)).toBe(true);
  });

  it("returns true for a TEXTAREA element", () => {
    const textarea = document.createElement("textarea");
    expect(isEditableTarget(textarea)).toBe(true);
  });

  it("returns true for a contenteditable element", () => {
    const div = document.createElement("div");
    div.contentEditable = "true";
    expect(isEditableTarget(div)).toBe(true);
  });

  it("returns false for a non-editable button", () => {
    const button = document.createElement("button");
    expect(isEditableTarget(button)).toBe(false);
  });

  it("returns false for a plain div", () => {
    const div = document.createElement("div");
    expect(isEditableTarget(div)).toBe(false);
  });
});

describe("isInDialog", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function makeDialog(): HTMLDivElement {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    container.appendChild(dialog);
    return dialog;
  }

  it("returns false for null", () => {
    expect(isInDialog(null)).toBe(false);
  });

  it("returns false for non-HTMLElement event target", () => {
    expect(isInDialog(new EventTarget())).toBe(false);
  });

  it("returns true for an element directly inside a dialog", () => {
    const dialog = makeDialog();
    const button = document.createElement("button");
    dialog.appendChild(button);
    expect(isInDialog(button)).toBe(true);
  });

  it("returns true for a deeply nested element inside a dialog", () => {
    const dialog = makeDialog();
    const inner = document.createElement("div");
    const span = document.createElement("span");
    inner.appendChild(span);
    dialog.appendChild(inner);
    expect(isInDialog(span)).toBe(true);
  });

  it("returns false for an element outside any dialog", () => {
    const div = document.createElement("div");
    container.appendChild(div);
    expect(isInDialog(div)).toBe(false);
  });
});
