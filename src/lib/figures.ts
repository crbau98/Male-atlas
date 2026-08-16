import type { Vec3 } from "./regions";

export type FigureMark = {
  id: string;
  label: string;
  plate: string;
  position: Vec3;
  regions: Array<"full" | "head" | "chest" | "abdomen" | "pelvis">;
};

export const FIGURES: FigureMark[] = [
  {
    id: "FJ1781",
    label: "Cerebellum",
    plate: "Encephalon",
    position: [0.0, 1.48, -0.04],
    regions: ["head"],
  },
  {
    id: "FJ1737",
    label: "Spinal cord",
    plate: "Encephalon",
    position: [0.0, 1.32, -0.06],
    regions: ["head", "chest"],
  },
  {
    id: "FJ1282",
    label: "Left eye",
    plate: "Encephalon",
    position: [-0.031, 1.595, 0.164],
    regions: ["head"],
  },
  {
    id: "FJ3483",
    label: "Left carotid",
    plate: "Encephalon",
    position: [-0.03, 1.48, 0.06],
    regions: ["head", "chest"],
  },
  {
    id: "FJ2429",
    label: "Heart",
    plate: "Thorax",
    position: [0.03, 1.27, 0.12],
    regions: ["chest"],
  },
  {
    id: "FJ3411",
    label: "Aortic arch",
    plate: "Thorax",
    position: [0.02, 1.36, 0.02],
    regions: ["chest"],
  },
  {
    id: "FJ2541",
    label: "Trachea",
    plate: "Thorax",
    position: [0.0, 1.4, 0.08],
    regions: ["chest"],
  },
  {
    id: "FJ3645",
    label: "SVC",
    plate: "Thorax",
    position: [0.02, 1.38, 0.04],
    regions: ["chest"],
  },
  {
    id: "FJ2563",
    label: "Esophagus",
    plate: "Thorax",
    position: [0.0, 1.32, 0.02],
    regions: ["chest"],
  },
  {
    id: "FJ2539",
    label: "Right bronchus",
    plate: "Thorax",
    position: [0.03, 1.36, 0.06],
    regions: ["chest"],
  },
  {
    id: "FJ3131",
    label: "Diaphragm",
    plate: "Thorax",
    position: [0.0, 1.16, 0.04],
    regions: ["chest", "abdomen"],
  },
  {
    id: "FJ2816",
    label: "Caudate liver",
    plate: "Abdomen",
    position: [0.04, 1.12, 0.04],
    regions: ["abdomen"],
  },
  {
    id: "FJ2817",
    label: "Gallbladder",
    plate: "Abdomen",
    position: [0.06, 1.06, 0.08],
    regions: ["abdomen"],
  },
  {
    id: "FJ2564",
    label: "Stomach",
    plate: "Abdomen",
    position: [-0.04, 1.08, 0.08],
    regions: ["abdomen"],
  },
  {
    id: "FJ1895",
    label: "Pancreas",
    plate: "Abdomen",
    position: [0.02, 1.05, 0.02],
    regions: ["abdomen"],
  },
  {
    id: "FJ1853",
    label: "Portal vein",
    plate: "Abdomen",
    position: [0.02, 1.08, 0.02],
    regions: ["abdomen"],
  },
  {
    id: "FJ3659",
    label: "IVC",
    plate: "Abdomen",
    position: [0.02, 1.1, -0.02],
    regions: ["abdomen"],
  },
  {
    id: "FJ2572",
    label: "Transverse colon",
    plate: "Abdomen",
    position: [0.0, 1.04, 0.08],
    regions: ["abdomen"],
  },
  {
    id: "FJ3145",
    label: "Left kidney",
    plate: "Abdomen",
    position: [-0.08, 1.08, -0.02],
    regions: ["abdomen"],
  },
  {
    id: "FJ3147",
    label: "Right kidney",
    plate: "Abdomen",
    position: [0.08, 1.06, -0.02],
    regions: ["abdomen"],
  },
  {
    id: "FJ3149",
    label: "Bladder",
    plate: "Pelvis",
    position: [0.0, 0.84, 0.08],
    regions: ["pelvis"],
  },
  {
    id: "FJ3139",
    label: "Prostate",
    plate: "Pelvis",
    position: [0.0, 0.8, 0.1],
    regions: ["pelvis"],
  },
  {
    id: "FJ3134",
    label: "Glans penis",
    plate: "Pelvis",
    position: [0.0, 0.81, 0.17],
    regions: ["pelvis"],
  },
  {
    id: "FJ3138",
    label: "Left testis",
    plate: "Pelvis",
    position: [-0.02, 0.76, 0.14],
    regions: ["pelvis"],
  },
];
