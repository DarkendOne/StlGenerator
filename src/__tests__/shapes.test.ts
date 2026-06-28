import { describe, it, expect } from "vitest";
import { createBox, createSphere, createCylinder } from "../shapes.js";

describe("createBox", () => {
  it("creates a box with 12 triangles (2 per face)", () => {
    const box = createBox();
    expect(box.name).toBe("box");
    expect(box.triangles).toHaveLength(12);
  });

  it("accepts custom dimensions and name", () => {
    const box = createBox({ width: 2, height: 4, depth: 6, name: "myBox" });
    expect(box.name).toBe("myBox");
    expect(box.triangles).toHaveLength(12);
  });

  it("all triangles have unit-length normals", () => {
    const box = createBox({ width: 3, height: 2, depth: 1 });
    for (const tri of box.triangles) {
      const len = Math.sqrt(
        tri.normal.x ** 2 + tri.normal.y ** 2 + tri.normal.z ** 2,
      );
      expect(len).toBeCloseTo(1);
    }
  });
});

describe("createSphere", () => {
  it("creates a sphere with the default name", () => {
    const sphere = createSphere();
    expect(sphere.name).toBe("sphere");
    expect(sphere.triangles.length).toBeGreaterThan(0);
  });

  it("creates more triangles with higher segment/ring counts", () => {
    const low = createSphere({ segments: 8, rings: 4 });
    const high = createSphere({ segments: 32, rings: 16 });
    expect(high.triangles.length).toBeGreaterThan(low.triangles.length);
  });

  it("all vertices lie on the sphere surface", () => {
    const radius = 5;
    const sphere = createSphere({ radius, segments: 16, rings: 8 });
    for (const tri of sphere.triangles) {
      for (const v of [tri.v1, tri.v2, tri.v3]) {
        const r = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
        expect(r).toBeCloseTo(radius, 5);
      }
    }
  });
});

describe("createCylinder", () => {
  it("creates a cylinder with the default name", () => {
    const cyl = createCylinder();
    expect(cyl.name).toBe("cylinder");
    expect(cyl.triangles.length).toBeGreaterThan(0);
  });

  it("creates a cone when radiusTop is 0", () => {
    const cone = createCylinder({ radiusTop: 0, radiusBottom: 1, segments: 8 });
    // Each segment: 1 bottom cap + 1 side triangle = 2 triangles (no top cap, no second side triangle)
    expect(cone.triangles).toHaveLength(8 * 2);
  });

  it("accepts a custom name", () => {
    const cyl = createCylinder({ name: "myCylinder" });
    expect(cyl.name).toBe("myCylinder");
  });
});
