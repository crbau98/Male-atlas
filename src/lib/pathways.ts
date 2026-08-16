import { catalog } from "./catalog";
import type { CatalogPart } from "./types";

export type PathwayId =
  | "arterial"
  | "venous"
  | "portal"
  | "airway"
  | "gut"
  | "urinary"
  | "reproductive"
  | "neural"
  | "biliary";

const LABELS: Record<PathwayId, string> = {
  arterial: "Systemic arteries",
  venous: "Systemic veins",
  portal: "Portal venous tree",
  airway: "Airway",
  gut: "Alimentary canal",
  urinary: "Urinary tract",
  reproductive: "Male genital tract",
  neural: "Central / peripheral nerves",
  biliary: "Biliary tree",
};

export function pathwayOf(name: string): PathwayId | null {
  const n = name.toLowerCase();
  if (/hepatic portal|pre-hepatic portal/.test(n)) return "portal";
  if (/hepatic duct|biliary|bile|gallbladder|cystic duct/.test(n)) return "biliary";
  if (/aort|iliac arter|femoral arter|carotid|subclavian arter|brachial arter|radial arter|ulnar arter|popliteal arter|tibial arter|coronary|hepatic arter/.test(n)) {
    return "arterial";
  }
  if (/vena|vein|caval|sinus of/.test(n)) return "venous";
  if (/bronchus|trachea|larynx|lung|alveol/.test(n)) return "airway";
  if (/stomach|duodenum|jejunum|ileum|colon|cecum|rectum|esophagus|intestin/.test(n)) return "gut";
  if (/kidney|renal|ureter|bladder|urethra/.test(n)) return "urinary";
  if (/testis|epididymis|ductus deferens|vas deferens|prostate|penis|glans|cavernosum|spongiosum|scrotum/.test(n)) {
    return "reproductive";
  }
  if (/nerve|spinal cord|brain|gyrus|cortex|cerebell|thalam|hippocamp|pons|medulla|hypothalamus/.test(n)) {
    return "neural";
  }
  return null;
}

export function pathwayLabel(name: string): string | null {
  const id = pathwayOf(name);
  return id ? LABELS[id] : null;
}

export function samePathway(a: string, b: string) {
  const pa = pathwayOf(a);
  return Boolean(pa && pa === pathwayOf(b));
}

export function pathwayMembers(name: string, limit = 8): CatalogPart[] {
  const id = pathwayOf(name);
  if (!id) return [];
  return catalog.parts
    .filter((part) => part.name !== name && pathwayOf(part.name) === id)
    .sort((a, b) => (b.triangles ?? 0) - (a.triangles ?? 0))
    .slice(0, limit);
}
