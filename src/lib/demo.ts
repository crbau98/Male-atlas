import type { ClipMode } from "./clip";
import { REGIONS, type RegionId, type Vec3 } from "./regions";

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
    title: "Living surface",
    body: "Photoreal volunteer skin. Tap anywhere to open a window, or let this demo peel the textbook plates for you.",
    region: "full",
    dissection: 0,
    explode: 0,
    clipMode: "off",
    peel: null,
  },
  {
    title: "Chest window",
    body: "A peel over the sternum. Heart, arch, and airway sit as a numbered plate under the ghost cavity.",
    region: "chest",
    dissection: 0.34,
    explode: 0,
    clipMode: "off",
    peel: REGIONS.chest.peel,
  },
  {
    title: "Sagittal thorax",
    body: "Sagittal clip keeps one half. Read the mediastinum the way a textbook section is printed.",
    region: "chest",
    dissection: 0.46,
    explode: 0,
    clipMode: "sagittal",
    peel: REGIONS.chest.peel,
  },
  {
    title: "Quarter cut",
    body: "Sagittal plus axial — a carpenter's quarter of the trunk, with a visible section plane.",
    region: "chest",
    dissection: 0.52,
    explode: 0,
    clipMode: "quarter",
    clipY: 1.22,
    peel: REGIONS.chest.peel,
  },
  {
    title: "Abdomen plate",
    body: "Liver remnant, stomach, pancreas, kidneys, and gut. Tap a number; Pathway keeps the related tree lit.",
    region: "abdomen",
    dissection: 0.44,
    explode: 0,
    clipMode: "off",
    peel: REGIONS.abdomen.peel,
  },
  {
    title: "X-ray viscera",
    body: "X-ray ghosts everything except the selected family so a vessel or gut loop can be traced.",
    region: "abdomen",
    dissection: 0.5,
    explode: 0,
    clipMode: "off",
    peel: REGIONS.abdomen.peel,
    xray: true,
  },
  {
    title: "Pelvis",
    body: "Bladder, prostate, and photoreal genitalia. Hold on the skin to widen the peel.",
    region: "pelvis",
    dissection: 0.28,
    explode: 0,
    clipMode: "off",
    peel: REGIONS.pelvis.peel,
  },
  {
    title: "Hemisection brain",
    body: "Sagittal plus coronal on the head — a classic hemisected encephalon.",
    region: "head",
    dissection: 0.62,
    explode: 0,
    clipMode: "hemi",
    peel: REGIONS.head.peel,
  },
];
