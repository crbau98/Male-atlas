import catalogJson from "@/data/catalog.json";
import type { Catalog, CatalogPart } from "./types";
import { GENITAL_PARTS } from "./genital-parts";

const base = catalogJson as Catalog;

const extra = GENITAL_PARTS.filter(
  (part) => !base.parts.some((existing) => existing.id === part.id),
);

export const catalog: Catalog = {
  ...base,
  meta: {
    ...base.meta,
    partCount: base.parts.length + extra.length,
  },
  parts: [...base.parts, ...extra],
};

export const partsById = new Map(
  catalog.parts.map((part) => [part.id, part] as const),
);

export function findPart(id: string | null): CatalogPart | undefined {
  if (!id) return undefined;
  return partsById.get(id);
}
