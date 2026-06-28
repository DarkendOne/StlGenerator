import { describe, it, expect } from "vitest";
import { subtract, cross, normalize, computeNormal, makeTriangle } from "../math.js";

describe("subtract", () => {
  it("subtracts two vectors", () => {
    expect(subtract({ x: 3, y: 5, z: 7 }, { x: 1, y: 2, z: 3 })).toEqual({
      x: 2,
      y: 3,
      z: 4,
    });
  });
});

describe("cross", () => {
  it("returns the cross product of two vectors", () => {
    const result = cross({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
    expect(result).toEqual({ x: 0, y: 0, z: 1 });
  });
});

describe("normalize", () => {
  it("normalizes a vector to unit length", () => {
    const result = normalize({ x: 3, y: 0, z: 0 });
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(0);
  });

  it("returns the zero vector when input length is zero", () => {
    expect(normalize({ x: 0, y: 0, z: 0 })).toEqual({ x: 0, y: 0, z: 0 });
  });
});

describe("computeNormal", () => {
  it("computes the upward normal for a CCW triangle in the XY plane", () => {
    const n = computeNormal(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
    );
    expect(n.x).toBeCloseTo(0);
    expect(n.y).toBeCloseTo(0);
    expect(n.z).toBeCloseTo(1);
  });
});

describe("makeTriangle", () => {
  it("creates a triangle with a computed normal", () => {
    const tri = makeTriangle(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
    );
    expect(tri.v1).toEqual({ x: 0, y: 0, z: 0 });
    expect(tri.v2).toEqual({ x: 1, y: 0, z: 0 });
    expect(tri.v3).toEqual({ x: 0, y: 1, z: 0 });
    expect(tri.normal.z).toBeCloseTo(1);
  });
});
