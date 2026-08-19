import type { ClipMode } from "./clip";
import type { RegionId, Vec3 } from "./regions";

export type DemoStep = {
  title: string;
  body: string;
  region: RegionId;
  dissection: number;
  explode: number;
  clipMode: ClipMode;
  clipY?: number;
  peel?: Vec3 | null;
  xray?: boolean;
};

export const DEMO: DemoStep[] = [
  {
    title: "Male sexual physiology",
    body: "Photoreal living nude male. Direct focus on explicit genitalia and sexual arousal physiology.",
    region: "pelvis",
    dissection: 0,
    explode: 0,
    clipMode: "off",
    peel: null,
  },
  {
    title: "Erectile tumescence",
    body: "Interactive tumescence, glans engorgement, vascular flush, and scrotal dartos contraction.",
    region: "pelvis",
    dissection: 0,
    explode: 0,
    clipMode: "off",
    peel: null,
  },
];
