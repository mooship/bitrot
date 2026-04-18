import { describe, expect, it } from "vitest";
import { mockEntry, mockEntryMinimal } from "../src/test/fixtures";
import { buildEntryOgTemplate, OG_HEIGHT, OG_WIDTH } from "./og-template";

function flatten(node: unknown): string[] {
  if (node === null || node === undefined) {
    return [];
  }
  if (typeof node === "string" || typeof node === "number") {
    return [String(node)];
  }
  if (Array.isArray(node)) {
    return node.flatMap(flatten);
  }
  if (typeof node === "object") {
    const asNode = node as { props?: { children?: unknown } };
    return flatten(asNode.props?.children);
  }
  return [];
}

describe("buildEntryOgTemplate", () => {
  it("exports 1200x630 dimensions", () => {
    expect(OG_WIDTH).toBe(1200);
    expect(OG_HEIGHT).toBe(630);
  });

  it("includes entry name, tagline, and lifespan", () => {
    const tree = buildEntryOgTemplate(mockEntry);
    const text = flatten(tree).join(" ");
    expect(text).toContain(mockEntry.name);
    expect(text).toContain(mockEntry.tagline);
    expect(text).toContain(`${mockEntry.born} – ${mockEntry.died}`);
  });

  it("includes the Bitrot site mark", () => {
    const tree = buildEntryOgTemplate(mockEntry);
    const text = flatten(tree).join(" ");
    expect(text).toContain("Bitrot");
    expect(text).toContain("Dead Tech Memorial");
  });

  it("renders entries without brandColor using the fallback background", () => {
    expect(() => buildEntryOgTemplate(mockEntryMinimal)).not.toThrow();
    const tree = buildEntryOgTemplate(mockEntryMinimal);
    const text = flatten(tree).join(" ");
    expect(text).toContain(mockEntryMinimal.name);
  });

  it("downscales the name font when names are long", () => {
    const longName = { ...mockEntry, name: "An Absurdly Long Dead Tech Name That Overflows" };
    const tree = buildEntryOgTemplate(longName);
    const root = tree as { props: { children: Array<{ props: { children: Array<{ props: { style?: { fontSize?: string } } }> } }> } };
    const titleBlock = root.props.children[1].props.children[0];
    expect(titleBlock.props.style?.fontSize).toBe("88px");
  });
});
