export type {
  Vector3,
  Triangle,
  Mesh,
  BoxOptions,
  SphereOptions,
  CylinderOptions,
} from "./types.js";

export { computeNormal, makeTriangle } from "./math.js";
export { createBox, createSphere, createCylinder } from "./shapes.js";
export { toAsciiStl, toBinaryStl } from "./export.js";
