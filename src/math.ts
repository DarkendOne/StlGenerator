import type { Vector3, Triangle } from "./types.js";

/** Subtract vector b from vector a. */
export function subtract(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/** Compute the cross product of two vectors. */
export function cross(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/** Normalize a vector to unit length. Returns the zero vector if length is zero. */
export function normalize(v: Vector3): Vector3 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/** Compute the unit normal for a triangle from its three vertices. */
export function computeNormal(v1: Vector3, v2: Vector3, v3: Vector3): Vector3 {
  return normalize(cross(subtract(v2, v1), subtract(v3, v1)));
}

/**
 * Build a Triangle, automatically computing the surface normal from the
 * three vertices in counter-clockwise winding order.
 */
export function makeTriangle(v1: Vector3, v2: Vector3, v3: Vector3): Triangle {
  return { normal: computeNormal(v1, v2, v3), v1, v2, v3 };
}
