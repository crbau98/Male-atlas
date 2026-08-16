"use client";

import type { AppearanceId } from "./types";
import type { ClipMode } from "./clip";
import { CLIP_CYCLE } from "./clip";
import { REGIONS, type RegionId } from "./regions";
import { APPEARANCES } from "./appearances";
import { useAtlas } from "./atlas-store";

const REGION_IDS = Object.keys(REGIONS) as RegionId[];
const APPEARANCE_IDS = APPEARANCES.map((a) => a.id);

export function buildViewUrl(): string {
  const s = useAtlas.getState();
  const params = new URLSearchParams();
  params.set("region", s.region);
  params.set("dissection", s.dissection.toFixed(2));
  if (s.explode > 0.01) params.set("explode", s.explode.toFixed(2));
  if (s.clipMode !== "off") params.set("clip", s.clipMode);
  if (s.appearanceId) params.set("look", s.appearanceId);
  params.set("nude", s.photoreal ? "1" : "0");
  if (s.xrayOn) params.set("xray", "1");
  if (s.pathwayOn === false) params.set("pathway", "0");
  if (s.selectedId) params.set("part", s.selectedId);

  const url = new URL(window.location.href);
  url.search = params.toString();
  url.hash = "";
  return url.toString();
}

export function applyViewFromUrl() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if ([...params.keys()].length === 0) return;

  const atlas = useAtlas.getState();

  const look = params.get("look");
  if (look && APPEARANCE_IDS.includes(look as AppearanceId)) {
    atlas.setAppearance(look as AppearanceId);
  }

  if (params.has("nude")) atlas.setPhotoreal(params.get("nude") === "1");

  const region = params.get("region");
  if (region && REGION_IDS.includes(region as RegionId)) {
    atlas.goRegion(region as RegionId);
  }

  const dissection = params.get("dissection");
  if (dissection !== null && Number.isFinite(Number(dissection))) {
    atlas.setDissection(Math.min(1, Math.max(0, Number(dissection))));
  }

  const explode = params.get("explode");
  if (explode !== null && Number.isFinite(Number(explode))) {
    atlas.setExplode(Math.min(1, Math.max(0, Number(explode))));
  }

  const clip = params.get("clip");
  if (clip && CLIP_CYCLE.includes(clip as ClipMode)) {
    atlas.setClipMode(clip as ClipMode);
  }

  if (params.get("xray") === "1") atlas.toggleXray();
  if (params.get("pathway") === "0") atlas.togglePathway();

  const part = params.get("part");
  if (part) atlas.select(part);

  window.history.replaceState(null, "", window.location.pathname);
}

export async function shareCurrentView(): Promise<"shared" | "copied" | "failed"> {
  const url = buildViewUrl();
  const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };

  if (nav.share) {
    try {
      await nav.share({ title: "Male Atlas — this view", url });
      return "shared";
    } catch {
      // User cancelled the native share sheet, or it isn't fully supported; try clipboard next.
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
