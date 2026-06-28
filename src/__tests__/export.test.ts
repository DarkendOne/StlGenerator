import { describe, it, expect } from "vitest";
import { createBox } from "../shapes.js";
import { toAsciiStl, toBinaryStl } from "../export.js";

const BOX_BINARY_HEADER_SIZE = 80;
const BOX_TRIANGLE_SIZE = 50; // 12 (normal) + 12 * 3 (vertices) + 2 (attr)

describe("toAsciiStl", () => {
  it("starts with 'solid <name>' and ends with 'endsolid <name>'", () => {
    const mesh = createBox({ name: "testBox" });
    const stl = toAsciiStl(mesh);
    expect(stl.startsWith("solid testBox")).toBe(true);
    expect(stl.endsWith("endsolid testBox")).toBe(true);
  });

  it("contains one facet block per triangle", () => {
    const mesh = createBox();
    const stl = toAsciiStl(mesh);
    const facetCount = (stl.match(/facet normal/g) ?? []).length;
    expect(facetCount).toBe(mesh.triangles.length);
  });
});

describe("toBinaryStl", () => {
  it("returns an ArrayBuffer of the correct size", () => {
    const mesh = createBox();
    const buffer = toBinaryStl(mesh);
    const expected =
      BOX_BINARY_HEADER_SIZE + 4 + mesh.triangles.length * BOX_TRIANGLE_SIZE;
    expect(buffer.byteLength).toBe(expected);
  });

  it("encodes the triangle count correctly", () => {
    const mesh = createBox();
    const buffer = toBinaryStl(mesh);
    const view = new DataView(buffer);
    expect(view.getUint32(BOX_BINARY_HEADER_SIZE, true)).toBe(
      mesh.triangles.length,
    );
  });
});
