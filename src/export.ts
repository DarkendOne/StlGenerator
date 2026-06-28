import type { Mesh, Triangle, Vector3 } from "./types.js";

// ── ASCII STL ──────────────────────────────────────────────────────────────

function vec3ToAscii(v: Vector3): string {
  return `${v.x} ${v.y} ${v.z}`;
}

function triangleToAscii(t: Triangle): string {
  return [
    `  facet normal ${vec3ToAscii(t.normal)}`,
    "    outer loop",
    `      vertex ${vec3ToAscii(t.v1)}`,
    `      vertex ${vec3ToAscii(t.v2)}`,
    `      vertex ${vec3ToAscii(t.v3)}`,
    "    endloop",
    "  endfacet",
  ].join("\n");
}

/**
 * Serialize a mesh to an ASCII STL string.
 *
 * ASCII STL files are human-readable and are accepted by all 3D printers /
 * slicers, but they are larger than the binary equivalent.
 *
 * @example
 * const stl = toAsciiStl(mesh);
 * const blob = new Blob([stl], { type: "model/stl" });
 */
export function toAsciiStl(mesh: Mesh): string {
  const lines = [`solid ${mesh.name}`];
  for (const tri of mesh.triangles) {
    lines.push(triangleToAscii(tri));
  }
  lines.push(`endsolid ${mesh.name}`);
  return lines.join("\n");
}

// ── Binary STL ─────────────────────────────────────────────────────────────

const BINARY_HEADER_SIZE = 80;
const BINARY_TRIANGLE_SIZE = 50; // 12 + 12 + 12 + 12 + 2 bytes

/**
 * Serialize a mesh to a binary STL `ArrayBuffer`.
 *
 * Binary STL files are more compact than ASCII files (50 bytes per triangle
 * vs many more for ASCII) and are preferred for large meshes.
 *
 * @example
 * const buffer = toBinaryStl(mesh);
 * const blob = new Blob([buffer], { type: "model/stl" });
 */
export function toBinaryStl(mesh: Mesh): ArrayBuffer {
  const { triangles } = mesh;
  const buffer = new ArrayBuffer(
    BINARY_HEADER_SIZE + 4 + triangles.length * BINARY_TRIANGLE_SIZE,
  );
  const view = new DataView(buffer);

  // Header: 80 bytes (ASCII text, zero-padded)
  const headerText = `Binary STL – ${mesh.name}`;
  for (let i = 0; i < Math.min(headerText.length, BINARY_HEADER_SIZE); i++) {
    view.setUint8(i, headerText.charCodeAt(i));
  }

  // Triangle count
  view.setUint32(BINARY_HEADER_SIZE, triangles.length, true);

  let offset = BINARY_HEADER_SIZE + 4;
  for (const tri of triangles) {
    for (const v of [tri.normal, tri.v1, tri.v2, tri.v3]) {
      view.setFloat32(offset, v.x, true);
      view.setFloat32(offset + 4, v.y, true);
      view.setFloat32(offset + 8, v.z, true);
      offset += 12;
    }
    view.setUint16(offset, 0, true); // attribute byte count
    offset += 2;
  }

  return buffer;
}
