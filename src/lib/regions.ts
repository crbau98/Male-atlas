export type Vec3 = [number, number, number];

export type RegionId = "full" | "head" | "chest" | "abdomen" | "pelvis";

export type Region = {
  id: RegionId;
  label: string;
  eye: Vec3;
  target: Vec3;
  dissection: number;
  peel: Vec3 | null;
};

export const REGIONS: Record<RegionId, Region> = {
  full: {
    id: "full",
    label: "Full",
    eye: [0, 0.95, 2.45],
    target: [0, 0.92, 0],
    dissection: 0,
    peel: null,
  },
  head: {
    id: "head",
    label: "Brain",
    eye: [0.2, 1.58, 0.62],
    target: [0, 1.54, 0.02],
    dissection: 0.56,
    peel: [0, 1.55, 0.1],
  },
  chest: {
    id: "chest",
    label: "Chest",
    eye: [0.38, 1.32, 0.95],
    target: [0.02, 1.26, 0.06],
    dissection: 0.34,
    peel: [0.03, 1.27, 0.15],
  },
  abdomen: {
    id: "abdomen",
    label: "Belly",
    eye: [0.32, 1.08, 0.9],
    target: [0, 1.02, 0.05],
    dissection: 0.4,
    peel: [0, 1.04, 0.14],
  },
  pelvis: {
    id: "pelvis",
    label: "Pelvis",
    eye: [0.22, 0.9, 0.62],
    target: [0, 0.8, 0.12],
    dissection: 0.24,
    peel: [0, 0.81, 0.17],
  },
};

export const HOTSPOTS: Array<{ region: RegionId; position: Vec3; label: string }> = [
  { region: "head", position: [0, 1.62, 0.11], label: "Brain" },
  { region: "chest", position: [0.05, 1.28, 0.17], label: "Chest" },
  { region: "abdomen", position: [0, 1.05, 0.17], label: "Belly" },
  { region: "pelvis", position: [0, 0.82, 0.19], label: "Pelvis" },
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
    title: "Living surface",
    body: "Drag to orbit. Tap skin to peel a window. Double-tap a named part to isolate it.",
    region: "full",
    explode: 0,
  },
  {
    title: "Chest window",
    body: "Heart, lungs, and great vessels sit in the thorax. Raise dissection to keep going inward.",
    region: "chest",
    explode: 0,
  },
  {
    title: "Abdomen",
    body: "Liver, stomach, and intestines stack under the diaphragm.",
    region: "abdomen",
    explode: 0,
  },
  {
    title: "Pelvis",
    body: "Bladder, prostate, and photoreal genitalia. Tap the shaft or scrotum to name the mesh.",
    region: "pelvis",
    explode: 0,
  },
  {
    title: "Brain",
    body: "Parcellated cortex, white matter, and brainstem. Isolate a gyrus from Parts.",
    region: "head",
    explode: 0,
  },
  {
    title: "Skeleton",
    body: "Explode pulls neighboring meshes apart so you can read the FMA labels.",
    region: "full",
    explode: 0.22,
    dissection: 0.72,
  },
];
