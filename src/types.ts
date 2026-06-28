/** A point or vector in 3D space. */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** A single triangular face defined by three vertices and a surface normal. */
export interface Triangle {
  normal: Vector3;
  v1: Vector3;
  v2: Vector3;
  v3: Vector3;
}

/** A 3D mesh composed of triangles. */
export interface Mesh {
  name: string;
  triangles: Triangle[];
}

/** Options for creating a box mesh. */
export interface BoxOptions {
  /** Width along the X axis. Default: 1 */
  width?: number;
  /** Height along the Y axis. Default: 1 */
  height?: number;
  /** Depth along the Z axis. Default: 1 */
  depth?: number;
  /** Mesh name. Default: "box" */
  name?: string;
}

/** Options for creating a sphere mesh. */
export interface SphereOptions {
  /** Sphere radius. Default: 1 */
  radius?: number;
  /** Number of horizontal segments. Default: 16 */
  segments?: number;
  /** Number of vertical rings. Default: 8 */
  rings?: number;
  /** Mesh name. Default: "sphere" */
  name?: string;
}

/** Options for creating a cylinder mesh. */
export interface CylinderOptions {
  /** Radius at the top. Default: 1 */
  radiusTop?: number;
  /** Radius at the bottom. Default: 1 */
  radiusBottom?: number;
  /** Height along the Z axis. Default: 1 */
  height?: number;
  /** Number of radial segments. Default: 16 */
  segments?: number;
  /** Mesh name. Default: "cylinder" */
  name?: string;
}
