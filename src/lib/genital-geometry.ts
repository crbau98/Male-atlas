import * as THREE from "three";

function lathe(points: Array<[number, number]>, segments = 72) {
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
  const geo = lathe(
    [
      [0.0168, 0],
      [0.0184, 0.014],
      [0.0182, 0.038],
      [0.0175, 0.068],
      [0.0162, 0.094],
      [0.0146, 0.114],
    ],
    72,
  );

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i);

    // Bilobed corpora cavernosa cross-section (slightly wider in X than Z)
    x *= 1.04;
    z *= 0.96;

    // Dorsal vein ridge along top midline (z > 0, x near 0)
    if (z > 0.005) {
      const veinWidth = 0.0032;
      const veinHeight = 0.0012 * Math.sin((y / 0.114) * Math.PI);
      const veinFactor = Math.exp(-Math.pow(x / veinWidth, 2));
      z += veinFactor * veinHeight;
    }

    // Ventral urethral median furrow (z < 0, x near 0)
    if (z < -0.005) {
      const furrowFactor = Math.exp(-Math.pow(x / 0.0045, 2));
      z += furrowFactor * 0.0008;
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

export function createGlansGeometry() {
  const geo = lathe(
    [
      [0.0142, 0],
      [0.0210, 0.009],
      [0.0218, 0.018],
      [0.0192, 0.030],
      [0.0135, 0.040],
      [0.0062, 0.047],
      [0.0001, 0.050],
    ],
    72,
  );

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i);

    // Coronal flare & slight elliptical shaping
    x *= 1.05;
    z *= 0.98;

    // Corona glandis backward flare at coronal sulcus
    if (y < 0.022 && y > 0.005) {
      const rimFactor = Math.sin(((y - 0.005) / 0.017) * Math.PI);
      x *= 1 + rimFactor * 0.08;
      z *= 1 + rimFactor * 0.08;
    }

    // Ventral frenulum notch / ridge
    if (z < 0 && y < 0.028) {
      const frenulum = Math.exp(-Math.pow(x / 0.0028, 2)) * 0.0012 * (1 - y / 0.028);
      z -= frenulum;
    }

    // Urethral meatus vertical slit at the tip (apex)
    if (y > 0.042) {
      const meatusFactor = Math.exp(-Math.pow(x / 0.0018, 2)) * Math.exp(-Math.pow(z / 0.0035, 2));
      const depth = (y - 0.042) * 0.0016;
      pos.setY(i, y - meatusFactor * depth);
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

export function createScrotumGeometry() {
  const geo = lathe(
    [
      [0.008, 0.022],
      [0.026, 0.014],
      [0.036, -0.006],
      [0.040, -0.028],
      [0.034, -0.048],
      [0.019, -0.062],
      [0.0001, -0.066],
    ],
    72,
  );

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const t = THREE.MathUtils.clamp((-y - 0.01) / 0.038, 0, 1);
    
    // Bilateral testicular lobe bulging
    const lobe = Math.tanh(x * 48) * 0.015 * t * t * (3 - 2 * t);
    x += lobe;
    z += Math.abs(lobe) * 0.18;

    // Natural testicular asymmetry: left testis sits ~3.5mm lower than right
    if (x < 0) {
      y -= Math.min(0.0035, Math.abs(x) * 0.15 * t);
    }

    // Median scrotal raphe ridge along anterior and posterior midline
    const rapheWidth = 0.0022;
    const rapheFactor = Math.exp(-Math.pow(x / rapheWidth, 2));
    z += rapheFactor * 0.0008 * t;

    pos.setXYZ(i, x, y, z);
  }

  // Multi-frequency dartos rugae wrinkles
  return wrinkle(geo, 0.0020, 2.7);
}

export const GENITAL_ROOT: [number, number, number] = [0, 0.838, 0.086];
export const SHAFT_LENGTH = 0.114;
