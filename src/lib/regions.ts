export type Vec3 = [number, number, number];

export type RegionId = "pelvis" | "close" | "angle" | "full";

export type Region = {
  id: RegionId;
  label: string;
  eye: Vec3;
  target: Vec3;
  dissection: number;
  peel: Vec3 | null;
};

export const REGIONS: Record<RegionId, Region> = {
  pelvis: {
    id: "pelvis",
    label: "Genitalia",
    eye: [0.10, 0.85, 0.44],
    target: [0, 0.81, 0.08],
    dissection: 0,
    peel: null,
  },
  close: {
    id: "close",
    label: "Glans & Shaft",
    eye: [0.04, 0.84, 0.28],
    target: [0, 0.83, 0.08],
    dissection: 0,
    peel: null,
  },
  angle: {
    id: "angle",
    label: "Side & Dartos",
    eye: [0.26, 0.88, 0.36],
    target: [0, 0.81, 0.08],
    dissection: 0,
    peel: null,
  },
  full: {
    id: "full",
    label: "Pelvic Overview",
    eye: [0.16, 0.88, 0.62],
    target: [0, 0.81, 0.08],
    dissection: 0,
    peel: null,
  },
};

export const HOTSPOTS: Array<{ region: RegionId; position: Vec3; label: string }> = [
  { region: "pelvis", position: [0, 0.82, 0.09], label: "Genitalia" },
];

export type TourStep = {
  title: string;
  body: string;
  region: RegionId;
  explode: number;
  dissection?: number;
};

export const TOUR: TourStep[] = [
  {
    title: "Male sexual arousal physiology",
    body: "Interactive photorealistic male genitalia with natural erectile tumescence, vascular flush, and scrotal dartos reflex.",
    region: "pelvis",
    explode: 0,
  },
];
