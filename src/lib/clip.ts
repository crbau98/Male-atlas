export type ClipMode = "off" | "axial" | "sagittal" | "coronal";

export function clipPlaneArgs(mode: ClipMode, clipY: number): { normal: [number, number, number]; constant: number } | null {
  if (mode === "off") return null;
  if (mode === "axial") return { normal: [0, -1, 0], constant: clipY };
  if (mode === "sagittal") return { normal: [-1, 0, 0], constant: 0.008 };
  return { normal: [0, 0, -1], constant: 0.05 };
}

export function relatedName(a: string, b: string) {
  const base = (n: string) =>
    n
      .toLowerCase()
      .replace(/^(left|right|anterior|posterior|superior|inferior)\s+/g, "")
      .replace(/\s+of\s+.*/, "");
  return base(a) === base(b) && a !== b;
}
