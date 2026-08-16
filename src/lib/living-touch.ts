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
      return { affect: 0.92, arousal: 0.1 };
    case "chest":
      return { affect: 0.72, arousal: 0.3 };
    case "belly":
      return { affect: 0.48, arousal: 0.24 };
    case "pelvis":
      return { affect: 0.38, arousal: 1 };
    default:
      return { affect: 0.22, arousal: 0.08 };
  }
}

export function zoneLabel(zone: TouchZone | null): string {
  switch (zone) {
    case "face":
      return "Face — warmth in the eyes, a softer mouth";
    case "chest":
      return "Chest — flush, closer breath, nipples";
    case "belly":
      return "Belly — settling, slower breath";
    case "pelvis":
      return "Pelvis — tumescence, dartos, vascular flush";
    case "limb":
      return "Skin — light affect";
    default:
      return "Touch the living surface";
  }
}

export function pulseHaptic(zone: TouchZone) {
  if (zone === "pelvis") haptic([10, 28, 16, 40, 12]);
  else if (zone === "face") haptic(8);
  else haptic(11);
}
