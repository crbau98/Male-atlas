"use client";

import { create } from "zustand";
import type { AppearanceId, CatalogPart } from "./types";
import { SYSTEM_ORDER } from "./systems";
import { REGIONS, TOUR, type RegionId, type Vec3 } from "./regions";

type CameraGoal = { eye: Vec3; target: Vec3 };

type AtlasState = {
  appearanceId: AppearanceId | null;
  dissection: number;
  explode: number;
  clipY: number;
  clipEnabled: boolean;
  peelCenter: Vec3 | null;
  peelRadius: number;
  selectedId: string | null;
  hoveredId: string | null;
  isolated: boolean;
  hidden: Set<string>;
  systemOn: Record<string, boolean>;
  search: string;
  brainFocus: boolean;
  pelvisFocus: boolean;
  photoreal: boolean;
  mobileTab: "view" | "parts" | "info";
  cameraGoal: CameraGoal | null;
  region: RegionId;
  tourIndex: number | null;
  setAppearance: (id: AppearanceId | null) => void;
  setDissection: (v: number) => void;
  setExplode: (v: number) => void;
  setClipY: (v: number) => void;
  setClipEnabled: (v: boolean) => void;
  setPeel: (center: Vec3 | null, radius?: number) => void;
  setPeelRadius: (radius: number) => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  toggleIsolate: () => void;
  hideSelected: () => void;
  toggleSystem: (id: string) => void;
  setSearch: (q: string) => void;
  setBrainFocus: (v: boolean) => void;
  setPelvisFocus: (v: boolean) => void;
  setPhotoreal: (v: boolean) => void;
  setMobileTab: (v: "view" | "parts" | "info") => void;
  lookAt: (target: Vec3, eye?: Vec3) => void;
  goRegion: (id: RegionId) => void;
  clearCameraGoal: () => void;
  startTour: () => void;
  nextTour: () => void;
  stopTour: () => void;
  applyTourStep: (index: number) => void;
  resetView: () => void;
};

const defaultSystems = Object.fromEntries(SYSTEM_ORDER.map((s) => [s, true]));

function applyRegionPatch(id: RegionId) {
  const region = REGIONS[id];
  return {
    region: id,
    cameraGoal: { eye: region.eye, target: region.target },
    brainFocus: id === "head",
    pelvisFocus: id === "pelvis",
    dissection: region.dissection,
    peelCenter: region.peel,
    peelRadius: region.peel ? 0.13 : 0.12,
  };
}

export const useAtlas = create<AtlasState>((set, get) => ({
  appearanceId: "julian",
  dissection: 0,
  explode: 0,
  clipY: 1.8,
  clipEnabled: false,
  peelCenter: null,
  peelRadius: 0.12,
  selectedId: null,
  hoveredId: null,
  isolated: false,
  hidden: new Set(),
  systemOn: defaultSystems,
  search: "",
  brainFocus: false,
  pelvisFocus: false,
  photoreal: true,
  mobileTab: "view",
  cameraGoal: null,
  region: "full",
  tourIndex: null,
  setAppearance: (id) => set({ appearanceId: id }),
  setDissection: (dissection) => set({ dissection }),
  setExplode: (explode) => set({ explode }),
  setClipY: (clipY) => set({ clipY }),
  setClipEnabled: (clipEnabled) => set({ clipEnabled }),
  setPeel: (peelCenter, peelRadius) =>
    set({ peelCenter, peelRadius: peelRadius ?? get().peelRadius }),
  setPeelRadius: (peelRadius) => set({ peelRadius }),
  select: (selectedId) => set({ selectedId, isolated: false }),
  hover: (hoveredId) => set({ hoveredId }),
  toggleIsolate: () => set({ isolated: !get().isolated }),
  hideSelected: () => {
    const id = get().selectedId;
    if (!id) return;
    const hidden = new Set(get().hidden);
    hidden.add(id);
    set({ hidden, selectedId: null, isolated: false });
  },
  toggleSystem: (id) =>
    set({ systemOn: { ...get().systemOn, [id]: !get().systemOn[id] } }),
  setSearch: (search) => set({ search }),
  setBrainFocus: (brainFocus) => {
    if (brainFocus) get().goRegion("head");
    else set({ brainFocus: false });
  },
  setPelvisFocus: (pelvisFocus) => {
    if (pelvisFocus) get().goRegion("pelvis");
    else set({ pelvisFocus: false });
  },
  setPhotoreal: (photoreal) => set({ photoreal }),
  setMobileTab: (mobileTab) => set({ mobileTab }),
  lookAt: (target, eye) => {
    const [x, y, z] = target;
    set({
      cameraGoal: {
        target,
        eye: eye ?? [x + 0.28, y + 0.12, z + 0.48],
      },
    });
  },
  goRegion: (id) => set(applyRegionPatch(id)),
  clearCameraGoal: () => set({ cameraGoal: null }),
  applyTourStep: (index) => {
    const step = TOUR[index];
    if (!step) {
      set({ tourIndex: null, explode: 0 });
      get().goRegion("full");
      return;
    }
    set({
      tourIndex: index,
      photoreal: true,
      isolated: false,
      selectedId: null,
      ...applyRegionPatch(step.region),
      explode: step.explode,
      dissection: step.dissection ?? REGIONS[step.region].dissection,
    });
  },
  startTour: () => get().applyTourStep(0),
  nextTour: () => {
    const current = get().tourIndex ?? -1;
    get().applyTourStep(current + 1);
  },
  stopTour: () => set({ tourIndex: null }),
  resetView: () =>
    set({
      dissection: 0,
      explode: 0,
      clipEnabled: false,
      clipY: 1.8,
      peelCenter: null,
      selectedId: null,
      isolated: false,
      hidden: new Set(),
      brainFocus: false,
      pelvisFocus: false,
      photoreal: true,
      systemOn: defaultSystems,
      cameraGoal: { eye: REGIONS.full.eye, target: REGIONS.full.target },
      region: "full",
      tourIndex: null,
      mobileTab: "view",
    }),
}));

export function partMatches(part: CatalogPart, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    part.name.toLowerCase().includes(q) ||
    part.fmaId.toLowerCase().includes(q) ||
    part.id.toLowerCase().includes(q) ||
    part.aliases.some((a) => a.toLowerCase().includes(q))
  );
}
