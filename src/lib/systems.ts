import type { SystemId } from "./types";

export type { SystemId };

export const SYSTEM_META: Record<
  SystemId,
  { label: string; color: string; depth: number; description: string }
> = {
  integument: {
    label: "Integument",
    color: "#d2a08c",
    depth: 0,
    description: "Skin and surface covering of the adult male volunteer.",
  },
  muscular: {
    label: "Muscular",
    color: "#b23a48",
    depth: 0.12,
    description: "Skeletal muscle, tendons, and ligaments.",
  },
  cardiovascular: {
    label: "Cardiovascular",
    color: "#c41e3a",
    depth: 0.28,
    description: "Heart, arteries, veins, and coronary tree.",
  },
  lymphatic: {
    label: "Lymphatic",
    color: "#6eba96",
    depth: 0.32,
    description: "Lymphatics, spleen, and thymus.",
  },
  respiratory: {
    label: "Respiratory",
    color: "#e8b0b8",
    depth: 0.36,
    description: "Airway, lungs, pleura, and diaphragm.",
  },
  digestive: {
    label: "Digestive",
    color: "#c4a064",
    depth: 0.38,
    description: "Alimentary canal, liver, pancreas, and salivary glands.",
  },
  urinary: {
    label: "Urinary",
    color: "#d4c45a",
    depth: 0.4,
    description: "Kidneys, ureters, bladder, and urethra.",
  },
  reproductive: {
    label: "Male reproductive",
    color: "#c989a8",
    depth: 0.42,
    description: "Testes, ducts, prostate, and external genitalia.",
  },
  endocrine: {
    label: "Endocrine",
    color: "#8fbc8f",
    depth: 0.44,
    description: "Thyroid, adrenals, pituitary, and pineal.",
  },
  sensory: {
    label: "Special senses",
    color: "#9ec9e8",
    depth: 0.46,
    description: "Eyes, inner ears, and related apparatus.",
  },
  nervous: {
    label: "Nervous",
    color: "#e8bad2",
    depth: 0.52,
    description: "Brain, spinal cord, cranial and peripheral nerves.",
  },
  skeletal: {
    label: "Skeletal",
    color: "#f2ecdc",
    depth: 0.62,
    description: "Bones, cartilages, and cranial vault.",
  },
  other: {
    label: "Other",
    color: "#aaaab4",
    depth: 0.5,
    description: "Unclassified BodyParts3D elements.",
  },
};

export const SYSTEM_ORDER: SystemId[] = [
  "integument",
  "muscular",
  "cardiovascular",
  "lymphatic",
  "respiratory",
  "digestive",
  "urinary",
  "reproductive",
  "endocrine",
  "sensory",
  "nervous",
  "skeletal",
  "other",
];

export function systemVisibleAtDepth(system: string, depth: number): boolean {
  const meta = SYSTEM_META[system as SystemId] ?? SYSTEM_META.other;
  if (system === "integument") return depth < 0.08;
  return depth >= meta.depth - 0.08;
}

export const SYSTEM_LOOK: Record<
  SystemId,
  { roughness: number; clearcoat: number; sheen: number; metalness: number; env: number }
> = {
  integument: { roughness: 0.45, clearcoat: 0.12, sheen: 0.4, metalness: 0, env: 0.9 },
  muscular: { roughness: 0.46, clearcoat: 0.08, sheen: 0.32, metalness: 0, env: 0.75 },
  cardiovascular: { roughness: 0.26, clearcoat: 0.28, sheen: 0.08, metalness: 0.03, env: 0.95 },
  lymphatic: { roughness: 0.4, clearcoat: 0.1, sheen: 0.12, metalness: 0, env: 0.7 },
  respiratory: { roughness: 0.5, clearcoat: 0.06, sheen: 0.15, metalness: 0, env: 0.65 },
  digestive: { roughness: 0.42, clearcoat: 0.1, sheen: 0.1, metalness: 0, env: 0.7 },
  urinary: { roughness: 0.4, clearcoat: 0.12, sheen: 0.08, metalness: 0, env: 0.7 },
  reproductive: { roughness: 0.36, clearcoat: 0.16, sheen: 0.2, metalness: 0, env: 0.8 },
  endocrine: { roughness: 0.44, clearcoat: 0.08, sheen: 0.1, metalness: 0, env: 0.65 },
  sensory: { roughness: 0.3, clearcoat: 0.35, sheen: 0.05, metalness: 0.02, env: 1 },
  nervous: { roughness: 0.38, clearcoat: 0.14, sheen: 0.12, metalness: 0, env: 0.8 },
  skeletal: { roughness: 0.3, clearcoat: 0.48, sheen: 0, metalness: 0.05, env: 1.05 },
  other: { roughness: 0.45, clearcoat: 0.08, sheen: 0, metalness: 0, env: 0.65 },
};

