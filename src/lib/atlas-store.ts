"use client";

import { create } from "zustand";
import type { AppearanceId, CatalogPart } from "./types";
import { SYSTEM_ORDER } from "./systems";

type Vec3 = [number, number, number];

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
  photoreal: boolean;
  setAppearance: (id: AppearanceId | null) => void;
  setDissection: (v: number) => void;
  setExplode: (v: number) => void;
  setClipY: (v: number) => void;
  setClipEnabled: (v: boolean) => void;
  setPeel: (center: Vec3 | null, radius?: number) => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  toggleIsolate: () => void;
  hideSelected: () => void;
  toggleSystem: (id: string) => void;
  setSearch: (q: string) => void;
  setBrainFocus: (v: boolean) => void;
  setPhotoreal: (v: boolean) => void;
  resetView: () => void;
};

const defaultSystems = Object.fromEntries(SYSTEM_ORDER.map((s) => [s, true]));

export const useAtlas = create<AtlasState>((set, get) => ({
  appearanceId: null,
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
  photoreal: true,
  setAppearance: (id) => set({ appearanceId: id }),
  setDissection: (dissection) => set({ dissection }),
  setExplode: (explode) => set({ explode }),
  setClipY: (clipY) => set({ clipY }),
  setClipEnabled: (clipEnabled) => set({ clipEnabled }),
  setPeel: (peelCenter, peelRadius) =>
    set({ peelCenter, peelRadius: peelRadius ?? get().peelRadius }),
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
  setBrainFocus: (brainFocus) =>
    set({
      brainFocus,
      dissection: brainFocus ? Math.max(get().dissection, 0.55) : get().dissection,
    }),
  setPhotoreal: (photoreal) => set({ photoreal }),
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
      photoreal: true,
      systemOn: defaultSystems,
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
