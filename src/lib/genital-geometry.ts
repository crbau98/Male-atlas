import * as THREE from "three";

function lathe(points: Array<[number, number]>, segments = 64) {
  const curve = points.map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(curve, segments);
  geo.computeVertexNormals();
  return geo;
}

function wrinkle(geometry: THREE.BufferGeometry, amount: number, seed: number) {
  const pos = geometry.attributes.position;
  const nrm = geometry.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const waves =
      Math.sin(x * 92 + seed) * Math.sin(y * 70 + z * 40) * 0.45 +
      Math.sin(x * 160 + y * 90) * 0.3 +
      Math.sin((Math.hypot(x, z) - 0.016) * 140) * 0.25;
    const lift = waves * amount;
    pos.setXYZ(
      i,
      x + (nrm?.getX(i) ?? 0) * lift,
      y + (nrm?.getY(i) ?? 0) * lift,
      z + (nrm?.getZ(i) ?? 0) * lift,
    );
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export function createShaftGeometry() {
  return lathe(
    [
      [0.0138, 0],
      [0.0152, 0.012],
      [0.0146, 0.034],
      [0.0138, 0.056],
      [0.0128, 0.074],
      [0.0116, 0.086],
    ],
    72,
  );
}

export function createGlansGeometry() {
  return lathe(
    [
      [0.0114, 0],
      [0.0168, 0.006],
      [0.0176, 0.011],
      [0.0154, 0.02],
      [0.0104, 0.028],
      [0.0048, 0.033],
      [0.0001, 0.035],
    ],
    72,
  );
}

export function createScrotumGeometry() {
  const geo = lathe(
    [
      [0.006, 0.016],
      [0.02, 0.01],
      [0.028, -0.004],
      [0.031, -0.02],
      [0.026, -0.034],
      [0.014, -0.044],
      [0.0001, -0.047],
    ],
    72,
  );
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = THREE.MathUtils.clamp((-y - 0.01) / 0.025, 0, 1);
    const lobe = Math.tanh(x * 55) * 0.011 * t * t * (3 - 2 * t);
    pos.setX(i, x + lobe);
    pos.setZ(i, z + Math.abs(lobe) * 0.15);
  }
  return wrinkle(geo, 0.0016, 2.1);
}

export const GENITAL_ROOT: [number, number, number] = [0, 0.838, 0.086];
export const SHAFT_LENGTH = 0.086;
