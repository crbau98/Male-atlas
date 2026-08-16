export type ClipMode = "off" | "axial" | "sagittal" | "coronal" | "quarter" | "hemi";

export type ClipPlaneSpec = { normal: [number, number, number]; constant: number };

const SAGITTAL: ClipPlaneSpec = { normal: [-1, 0, 0], constant: 0.008 };
const CORONAL: ClipPlaneSpec = { normal: [0, 0, -1], constant: 0.05 };

export function clipPlaneList(mode: ClipMode, clipY: number): ClipPlaneSpec[] {
  const axial: ClipPlaneSpec = { normal: [0, -1, 0], constant: clipY };
  if (mode === "off") return [];
  if (mode === "axial") return [axial];
  if (mode === "sagittal") return [SAGITTAL];
  if (mode === "coronal") return [CORONAL];
  if (mode === "quarter") return [SAGITTAL, axial];
  if (mode === "hemi") return [SAGITTAL, CORONAL];
  return [];
}

export function relatedName(a: string, b: string) {
  const base = (n: string) =>
    n
      .toLowerCase()
      .replace(/^(left|right|anterior|posterior|superior|inferior)\s+/g, "")
      .replace(/\s+of\s+.*/, "");
  return base(a) === base(b) && a !== b;
}
