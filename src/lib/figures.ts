import type { RegionId, Vec3 } from "./regions";

export type FigureMark = {
  id: string;
  label: string;
  plate: string;
  position: Vec3;
  regions: RegionId[];
};

export const FIGURES: FigureMark[] = [
  {
    id: "FJ3132",
    label: "Corpus cavernosum (Shaft)",
    plate: "Genitalia",
    position: [0.0, 0.84, 0.12],
    regions: ["pelvis", "full", "close", "angle"],
  },
  {
    id: "FJ3134",
    label: "Glans penis",
    plate: "Genitalia",
    position: [0.0, 0.81, 0.16],
    regions: ["pelvis", "full", "close", "angle"],
  },
  {
    id: "FJ3138",
    label: "Scrotum & Testis",
    plate: "Genitalia",
    position: [-0.02, 0.77, 0.11],
    regions: ["pelvis", "full", "angle"],
  },
  {
    id: "FJ3149",
    label: "Pelvic base & Perineum",
    plate: "Genitalia",
    position: [0.0, 0.85, 0.08],
    regions: ["pelvis", "full"],
  },
];
