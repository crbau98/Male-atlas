"use client";

import { partsById } from "./catalog";
import { FIGURES } from "./figures";
import { SYSTEM_META, type SystemId } from "./systems";
import { useAtlas } from "./atlas-store";
import { tapPart } from "./tap-part";

export function revealPart(id: string) {
  const atlas = useAtlas.getState();
  const part = partsById.get(id);
  const fig = FIGURES.find((f) => f.id === id);
  if (part) {
    const depth = SYSTEM_META[part.system as SystemId]?.depth ?? 0.3;
    atlas.setPhotoreal(true);
    atlas.setDissection(Math.max(atlas.dissection, Math.min(0.78, depth + 0.1)));
  }
  if (fig) {
    tapPart(id, fig.position);
    atlas.setMobileTab("info");
    return;
  }
  atlas.select(id);
  atlas.setMobileTab("info");
}
