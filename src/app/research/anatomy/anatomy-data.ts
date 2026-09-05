export type StudyMode = "surface" | "tissues" | "breathing" | "circulation";
export type CameraView =
  "anterior" | "posterior" | "lateral" | "pelvis" | "thorax";
export type Point = [number, number, number];
export const MODES: { id: StudyMode; title: string; description: string }[] = [
  {
    id: "surface",
    title: "Surface anatomy",
    description:
      "Adult reference mesh in a neutral anatomical pose. Genital anatomy is shown at rest. Skin presets change material appearance only.",
  },
  {
    id: "tissues",
    title: "Reproductive tissues",
    description:
      "BodyParts3D tissue meshes under a transparent body reference. Colors distinguish structures; registration between the two source models is approximate.",
  },
  {
    id: "breathing",
    title: "Respiratory motion",
    description:
      "Explore an illustrative breathing cycle alongside segmented airways and diaphragm. Chest excursion is exaggerated slightly for teaching, not fitted to measured ventilation.",
  },
  {
    id: "circulation",
    title: "Circulation schematic",
    description:
      "Moving markers indicate conceptual outward and return flow. Paths are a simplified systemic circuit, not anatomically segmented vessels or a complete circulatory model.",
  },
];
export const SKINS = [
  { name: "Light", color: "#f1d6c3" },
  { name: "Warm", color: "#d9ae87" },
  { name: "Medium", color: "#b17c56" },
  { name: "Deep", color: "#694634" },
];
export const STRUCTURES: {
  id: string;
  name: string;
  color: string;
  description: string;
}[] = [
  {
    id: "FJ3132",
    name: "Corpora cavernosa",
    color: "#cf8977",
    description:
      "Paired erectile tissue bodies. This static mesh shows structural relationships; it does not model erectile response.",
  },
  {
    id: "FJ3133",
    name: "Corpus spongiosum",
    color: "#d6b374",
    description:
      "Erectile tissue surrounding the spongy urethra. The urethral lumen is not separately segmented here.",
  },
  {
    id: "FJ3134",
    name: "Glans penis",
    color: "#deaaa1",
    description:
      "The expanded distal portion of the corpus spongiosum. Surface variation is not represented exhaustively.",
  },
  {
    id: "FJ3138",
    name: "Left testis",
    color: "#d7c7a1",
    description:
      "One of the paired gonads, normally contained within the scrotum. Left and right refer to the model's perspective.",
  },
  {
    id: "FJ3142",
    name: "Right testis",
    color: "#d7c7a1",
    description:
      "One of the paired gonads. This reference does not represent the full range of normal size or position.",
  },
  {
    id: "FJ3136",
    name: "Left epididymis",
    color: "#85bdb8",
    description:
      "A coiled duct associated with the testis, involved in sperm maturation and transport.",
  },
  {
    id: "FJ3141",
    name: "Right epididymis",
    color: "#85bdb8",
    description:
      "A coiled duct associated with the testis. Fine duct detail is below the resolution of this mesh.",
  },
  {
    id: "FJ3139",
    name: "Prostate",
    color: "#b1a1cb",
    description:
      "A gland below the bladder that contributes to seminal fluid. This view does not include all adjacent pelvic organs.",
  },
];
export const VIEWS: {
  id: CameraView;
  title: string;
  position: Point;
  target: Point;
}[] = [
  {
    id: "anterior",
    title: "Front",
    position: [0, 0.94, 2.65],
    target: [0, 0.86, 0],
  },
  {
    id: "posterior",
    title: "Back",
    position: [0, 0.94, -2.65],
    target: [0, 0.86, 0],
  },
  {
    id: "lateral",
    title: "Side",
    position: [2.65, 0.94, 0],
    target: [0, 0.86, 0],
  },
  {
    id: "pelvis",
    title: "Pelvis",
    position: [0.25, 0.91, 0.78],
    target: [0, 0.82, 0.045],
  },
  {
    id: "thorax",
    title: "Chest",
    position: [0.35, 1.3, 1.15],
    target: [0, 1.22, 0],
  },
];
export const MODEL_DEPTH_OFFSET = -0.1; // Approximate alignment, not clinical image registration.
export const CYCLE_SECONDS = 8;
export const breathExcursion = (time: number, breathsPerMinute: number) =>
  (1 - Math.cos(((time * breathsPerMinute) / 60) * 2 * Math.PI)) / 2;
