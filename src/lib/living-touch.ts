import { haptic } from "./haptics";

export type TouchZone = "face" | "chest" | "belly" | "pelvis" | "limb";

export function touchZone(
  x: number,
  y: number,
  z: number,
  genital: string | null,
): TouchZone {
  if (genital || (Math.abs(x) < 0.09 && y > 0.74 && y < 0.96 && z > 0.03)) return "pelvis";
  if (y > 1.48) return "face";
  if (y > 1.14 && Math.abs(x) < 0.22 && z > -0.02) return "chest";
  if (y > 0.92 && y <= 1.14) return "belly";
  return "limb";
}

export function zoneGains(zone: TouchZone): { affect: number; arousal: number } {
  switch (zone) {
    case "face":
      return { affect: 0.82, arousal: 0.25 };
    case "chest":
      return { affect: 0.65, arousal: 0.55 };
    case "belly":
      return { affect: 0.42, arousal: 0.68 };
    case "pelvis":
      return { affect: 0.35, arousal: 1.6 };
    default:
      return { affect: 0.20, arousal: 0.22 };
  }
}

export function zoneLabel(zone: TouchZone | null): string {
  switch (zone) {
    case "face":
      return "Face — softened expression, responsive warmth";
    case "chest":
      return "Chest — deeper breath, vascular flush, nipple sensitivity";
    case "belly":
      return "Lower abdomen — pelvic blood flow acceleration";
    case "pelvis":
      return "Genitalia — penile erection, glans engorgement, scrotal dartos contraction";
    case "limb":
      return "Sensory skin response";
    default:
      return "Touch the living surface";
  }
}

export function pulseHaptic(zone: TouchZone) {
  if (zone === "pelvis") haptic([10, 28, 16, 40, 12]);
  else if (zone === "face") haptic(8);
  else haptic(11);
}
