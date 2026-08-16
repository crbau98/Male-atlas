import type { CatalogPart } from "./types";

export const GENITAL_MESH_IDS = new Set([
  "FJ3132",
  "FJ3133",
  "FJ3134",
  "FJ3136",
  "FJ3138",
  "FJ3141",
  "FJ3142",
]);

export const GENITAL_SURFACE_IDS = new Set(["FJ3132", "FJ3134"]);

export const GENITAL_INNER_IDS = new Set(["FJ3133", "FJ3136", "FJ3138", "FJ3141", "FJ3142"]);

export const GENITAL_ANATOMY_COLOR: Record<string, string> = {
  FJ3134: "#c45a68",
  FJ3132: "#d08098",
  FJ3133: "#c07088",
  FJ3138: "#e8c4b8",
  FJ3142: "#e8c4b8",
  FJ3136: "#c989a8",
  FJ3141: "#c989a8",
};

export function isGenitalPartId(id: string | null | undefined): boolean {
  if (!id) return false;
  return GENITAL_MESH_IDS.has(id) || id === "scrotum";
}

export function isPelvisPoint(point: [number, number, number] | null): boolean {
  if (!point) return false;
  const [x, y, z] = point;
  return Math.abs(x) < 0.2 && y > 0.62 && y < 1.05 && z > -0.02;
}

/** Hit-test the volunteer skin's genital region in atlas meters. */
export function pickGenitalFromPoint(x: number, y: number, z: number): string | null {
  if (z < 0.04 || Math.abs(x) > 0.08 || y < 0.74 || y > 0.92) return null;
  if (Math.abs(x) < 0.018 && y > 0.784 && y < 0.822 && z > 0.12) return "FJ3134";
  if (Math.abs(x) < 0.038 && y > 0.776 && y < 0.872 && z > 0.08) return "FJ3132";
  if (Math.abs(x) < 0.055 && y > 0.748 && y < 0.82 && z > 0.04 && z < 0.16) {
    return "scrotum";
  }
  return null;
}

/** Named male external/internal genitalia (IS-A BodyParts3D + photoreal surface). */
export const GENITAL_PARTS: CatalogPart[] = [
  {
    id: "FJ3134",
    fmaId: "FMA18247",
    name: "glans penis",
    system: "reproductive",
    laterality: "median",
    aliases: ["glans"],
    file: "/models/systems/reproductive.glb",
  },
  {
    id: "FJ3132",
    fmaId: "FMA19618",
    name: "corpus cavernosum of penis",
    system: "reproductive",
    laterality: "median",
    aliases: ["corpora cavernosa"],
    file: "/models/systems/reproductive.glb",
  },
  {
    id: "FJ3133",
    fmaId: "FMA19617",
    name: "corpus spongiosum of penis",
    system: "reproductive",
    laterality: "median",
    aliases: ["urethral sponge"],
    file: "/models/systems/reproductive.glb",
  },
  {
    id: "FJ3138",
    fmaId: "FMA7212",
    name: "left testis",
    system: "reproductive",
    laterality: "left",
    aliases: ["left testicle"],
    file: "/models/systems/reproductive.glb",
  },
  {
    id: "FJ3142",
    fmaId: "FMA7211",
    name: "right testis",
    system: "reproductive",
    laterality: "right",
    aliases: ["right testicle"],
    file: "/models/systems/reproductive.glb",
  },
  {
    id: "FJ3136",
    fmaId: "FMA18257",
    name: "left epididymis",
    system: "reproductive",
    laterality: "left",
    aliases: [],
    file: "/models/systems/reproductive.glb",
  },
  {
    id: "FJ3141",
    fmaId: "FMA18256",
    name: "right epididymis",
    system: "reproductive",
    laterality: "right",
    aliases: [],
    file: "/models/systems/reproductive.glb",
  },
  {
    id: "scrotum",
    fmaId: "FMA18228",
    name: "scrotum",
    system: "reproductive",
    laterality: "median",
    aliases: ["scrotal sac"],
    file: "/models/systems/reproductive.glb",
  },
];
