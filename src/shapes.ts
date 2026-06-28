import type { Mesh, BoxOptions, SphereOptions, CylinderOptions, Vector3 } from "./types.js";
import { makeTriangle } from "./math.js";

/**
 * Create a rectangular box (cuboid) mesh.
 *
 * @example
 * const box = createBox({ width: 2, height: 3, depth: 1 });
 */
export function createBox(options: BoxOptions = {}): Mesh {
  const w = (options.width ?? 1) / 2;
  const h = (options.height ?? 1) / 2;
  const d = (options.depth ?? 1) / 2;
  const name = options.name ?? "box";

  // 8 corners of the box
  const p: Vector3[] = [
    { x: -w, y: -h, z: -d }, // 0
    { x:  w, y: -h, z: -d }, // 1
    { x:  w, y:  h, z: -d }, // 2
    { x: -w, y:  h, z: -d }, // 3
    { x: -w, y: -h, z:  d }, // 4
    { x:  w, y: -h, z:  d }, // 5
    { x:  w, y:  h, z:  d }, // 6
    { x: -w, y:  h, z:  d }, // 7
  ];

  return {
    name,
    triangles: [
      // Bottom (-Z)
      makeTriangle(p[0], p[2], p[1]),
      makeTriangle(p[0], p[3], p[2]),
      // Top (+Z)
      makeTriangle(p[4], p[5], p[6]),
      makeTriangle(p[4], p[6], p[7]),
      // Front (-Y)
      makeTriangle(p[0], p[1], p[5]),
      makeTriangle(p[0], p[5], p[4]),
      // Back (+Y)
      makeTriangle(p[2], p[3], p[7]),
      makeTriangle(p[2], p[7], p[6]),
      // Left (-X)
      makeTriangle(p[0], p[4], p[7]),
      makeTriangle(p[0], p[7], p[3]),
      // Right (+X)
      makeTriangle(p[1], p[2], p[6]),
      makeTriangle(p[1], p[6], p[5]),
    ],
  };
}

/**
 * Create a UV sphere mesh.
 *
 * @example
 * const sphere = createSphere({ radius: 5, segments: 32, rings: 16 });
 */
export function createSphere(options: SphereOptions = {}): Mesh {
  const radius = options.radius ?? 1;
  const segments = Math.max(3, options.segments ?? 16);
  const rings = Math.max(2, options.rings ?? 8);
  const name = options.name ?? "sphere";

  // Build a grid of vertices
  const verts: Vector3[][] = [];
  for (let r = 0; r <= rings; r++) {
    const phi = (Math.PI * r) / rings; // 0 … π
    const row: Vector3[] = [];
    for (let s = 0; s <= segments; s++) {
      const theta = (2 * Math.PI * s) / segments; // 0 … 2π
      row.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
      });
    }
    verts.push(row);
  }

  const triangles = [];
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const v00 = verts[r][s];
      const v01 = verts[r][s + 1];
      const v10 = verts[r + 1][s];
      const v11 = verts[r + 1][s + 1];

      if (r !== 0) {
        triangles.push(makeTriangle(v00, v10, v11));
      }
      if (r !== rings - 1) {
        triangles.push(makeTriangle(v00, v11, v01));
      }
    }
  }

  return { name, triangles };
}

/**
 * Create a cylinder (or cone) mesh. When `radiusTop` is 0 it produces a cone;
 * when `radiusTop === radiusBottom` it produces a standard cylinder.
 *
 * @example
 * const cylinder = createCylinder({ radiusTop: 1, radiusBottom: 1, height: 2 });
 */
export function createCylinder(options: CylinderOptions = {}): Mesh {
  const radiusTop = options.radiusTop ?? 1;
  const radiusBottom = options.radiusBottom ?? 1;
  const height = options.height ?? 1;
  const segments = Math.max(3, options.segments ?? 16);
  const name = options.name ?? "cylinder";

  const halfH = height / 2;
  const triangles = [];

  const topCenter: Vector3 = { x: 0, y: 0, z: halfH };
  const bottomCenter: Vector3 = { x: 0, y: 0, z: -halfH };

  for (let i = 0; i < segments; i++) {
    const theta0 = (2 * Math.PI * i) / segments;
    const theta1 = (2 * Math.PI * (i + 1)) / segments;

    const topA: Vector3 = {
      x: radiusTop * Math.cos(theta0),
      y: radiusTop * Math.sin(theta0),
      z: halfH,
    };
    const topB: Vector3 = {
      x: radiusTop * Math.cos(theta1),
      y: radiusTop * Math.sin(theta1),
      z: halfH,
    };
    const botA: Vector3 = {
      x: radiusBottom * Math.cos(theta0),
      y: radiusBottom * Math.sin(theta0),
      z: -halfH,
    };
    const botB: Vector3 = {
      x: radiusBottom * Math.cos(theta1),
      y: radiusBottom * Math.sin(theta1),
      z: -halfH,
    };

    // Top cap
    if (radiusTop > 0) {
      triangles.push(makeTriangle(topCenter, topB, topA));
    }

    // Bottom cap
    if (radiusBottom > 0) {
      triangles.push(makeTriangle(bottomCenter, botA, botB));
    }

    // Side wall
    triangles.push(makeTriangle(topA, botA, botB));
    if (radiusTop > 0) {
      triangles.push(makeTriangle(topA, botB, topB));
    }
  }

  return { name, triangles };
}
