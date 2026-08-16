export type SystemId =
  | "integument"
  | "skeletal"
  | "muscular"
  | "cardiovascular"
  | "lymphatic"
  | "nervous"
  | "respiratory"
  | "digestive"
  | "urinary"
  | "reproductive"
  | "endocrine"
  | "sensory"
  | "other";

export type CatalogPart = {
  id: string;
  fmaId: string;
  name: string;
  system: SystemId | string;
  laterality: "left" | "right" | "median" | string;
  aliases: string[];
  file: string;
  triangles?: number;
};

export type Catalog = {
  meta: {
    source: string;
    attribution: string;
    units: string;
    up: string;
    heightMeters: number;
    bounds: { min: number[]; max: number[] };
    partCount: number;
  };
  systems: string[];
  parts: CatalogPart[];
};

export type AppearanceId = "julian" | "malik" | "kenji" | "diego";
