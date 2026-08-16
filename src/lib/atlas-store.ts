"use client";

import { create } from "zustand";
import type { AppearanceId, CatalogPart } from "./types";
import { SYSTEM_ORDER } from "./systems";
import { REGIONS, TOUR, type RegionId, type Vec3 } from "./regions";
import type { ClipMode } from "./clip";
import { nextClipMode } from "./clip";
import { DEMO } from "./demo";
import type { TouchZone } from "./living-touch";

type CameraGoal = { eye?: Vec3; target: Vec3; distance?: number };
export type AtlasTheme = "dark" | "light";
export type LightingPreset = "museum" | "clinical" | "dramatic";
export type QualityMode = "auto" | "balanced" | "high";

type ViewSnap = {
  dissection: number;
  explode: number;
  clipY: number;
  clipEnabled: boolean;
  clipMode: ClipMode;
  peelCenter: Vec3 | null;
  peelRadius: number;
  selectedId: string | null;
  selectedPoint: Vec3 | null;
  isolated: boolean;
  familyOn: boolean;
  xrayOn: boolean;
  hidden: string[];
  region: RegionId;
  photoreal: boolean;
};

type AtlasState = {
  appearanceId: AppearanceId | null;
  dissection: number;
  explode: number;
  clipY: number;
  clipEnabled: boolean;
  clipMode: ClipMode;
  contextOn: boolean;
  pathwayOn: boolean;
  xrayOn: boolean;
  familyOn: boolean;
  peelCenter: Vec3 | null;
  peelRadius: number;
  selectedId: string | null;
  selectedPoint: Vec3 | null;
  hoveredId: string | null;
  isolated: boolean;
  hidden: Set<string>;
  hiddenStack: string[];
  systemOn: Record<string, boolean>;
  search: string;
  brainFocus: boolean;
  pelvisFocus: boolean;
  photoreal: boolean;
  mobileTab: "view" | "parts" | "info";
  cameraGoal: CameraGoal | null;
  region: RegionId;
  tourIndex: number | null;
  demoIndex: number | null;
  showLabels: boolean;
  pinned: Array<{ id: string; point: Vec3 }>;
  history: ViewSnap[];
  theme: AtlasTheme;
  lightingPreset: LightingPreset;
  qualityMode: QualityMode;
  physiologyOn: boolean;
  physiologyIntensity: number;
  breathingOn: boolean;
  affect: number;
  arousal: number;
  touchZone: TouchZone | null;
  setAppearance: (id: AppearanceId | null) => void;
  setDissection: (v: number) => void;
  setExplode: (v: number) => void;
  setClipY: (v: number) => void;
  setClipEnabled: (v: boolean) => void;
  setClipMode: (v: ClipMode) => void;
  setContextOn: (v: boolean) => void;
  toggleContext: () => void;
  togglePathway: () => void;
  toggleXray: () => void;
  toggleFamily: () => void;
  setPeel: (center: Vec3 | null, radius?: number) => void;
  setPeelRadius: (radius: number) => void;
  select: (id: string | null, point?: Vec3) => void;
  hover: (id: string | null) => void;
  toggleIsolate: () => void;
  hideSelected: () => void;
  undoHide: () => void;
  focusSelection: () => void;
  goAdjacentRegion: (dir: -1 | 1) => void;
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
  prevTour: () => void;
  stopTour: () => void;
  applyTourStep: (index: number) => void;
  startDemo: () => void;
  nextDemo: () => void;
  prevDemo: () => void;
  stopDemo: () => void;
  applyDemoStep: (index: number) => void;
  resetView: () => void;
  toggleLabels: () => void;
  pinSelection: () => void;
  cycleClip: () => void;
  closePeel: () => void;
  undoView: () => void;
  pushHistory: () => void;
  setTheme: (v: AtlasTheme) => void;
  setLightingPreset: (v: LightingPreset) => void;
  setQualityMode: (v: QualityMode) => void;
  togglePhysiology: () => void;
  setPhysiologyIntensity: (v: number) => void;
  toggleBreathing: () => void;
  setLiving: (patch: { affect?: number; arousal?: number; touchZone?: TouchZone | null }) => void;
};

const defaultSystems = Object.fromEntries(SYSTEM_ORDER.map((s) => [s, true]));

function takeSnap(s: {
  dissection: number;
  explode: number;
  clipY: number;
  clipEnabled: boolean;
  clipMode: ClipMode;
  peelCenter: Vec3 | null;
  peelRadius: number;
  selectedId: string | null;
  selectedPoint: Vec3 | null;
  isolated: boolean;
  familyOn: boolean;
  xrayOn: boolean;
  hidden: Set<string>;
  region: RegionId;
  photoreal: boolean;
}): ViewSnap {
  return {
    dissection: s.dissection,
    explode: s.explode,
    clipY: s.clipY,
    clipEnabled: s.clipEnabled,
    clipMode: s.clipMode,
    peelCenter: s.peelCenter,
    peelRadius: s.peelRadius,
    selectedId: s.selectedId,
    selectedPoint: s.selectedPoint,
    isolated: s.isolated,
    familyOn: s.familyOn,
    xrayOn: s.xrayOn,
    hidden: [...s.hidden],
    region: s.region,
    photoreal: s.photoreal,
  };
}

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
  clipMode: "off" as ClipMode,
  contextOn: true,
  pathwayOn: true,
  xrayOn: false,
  familyOn: false,
  peelCenter: null,
  peelRadius: 0.12,
  selectedId: null,
  selectedPoint: null,
  hoveredId: null,
  isolated: false,
  hidden: new Set(),
  hiddenStack: [],
  systemOn: defaultSystems,
  search: "",
  brainFocus: false,
  pelvisFocus: false,
  photoreal: true,
  mobileTab: "view",
  cameraGoal: null,
  region: "full",
  tourIndex: null,
  demoIndex: null,
  showLabels: false,
  pinned: [],
  history: [] as ViewSnap[],
  theme: "dark",
  lightingPreset: "museum",
  qualityMode: "auto",
  physiologyOn: true,
  physiologyIntensity: 0.68,
  breathingOn: true,
  affect: 0,
  arousal: 0,
  touchZone: null,
  setAppearance: (id) => set({ appearanceId: id }),
  setDissection: (dissection) => set({ dissection }),
  setExplode: (explode) => set({ explode }),
  setClipY: (clipY) => set({ clipY, clipEnabled: true, clipMode: get().clipMode === "off" ? "axial" : get().clipMode }),
  setClipEnabled: (clipEnabled) =>
    set({ clipEnabled, clipMode: clipEnabled ? (get().clipMode === "off" ? "axial" : get().clipMode) : "off" }),
  setClipMode: (clipMode) => {
    get().pushHistory();
    set({
      clipMode,
      clipEnabled: clipMode !== "off",
      clipY: clipMode === "quarter" && get().clipY > 1.65 ? 1.22 : get().clipY,
    });
  },
  setContextOn: (contextOn) => set({ contextOn }),
  toggleContext: () => set({ contextOn: !get().contextOn }),
  togglePathway: () => set({ pathwayOn: !get().pathwayOn }),
  toggleXray: () => set({ xrayOn: !get().xrayOn }),
  toggleFamily: () => {
    if (get().familyOn) set({ familyOn: false, isolated: false });
    else set({ familyOn: true, isolated: true });
  },
  setPeel: (peelCenter, peelRadius) => {
    const prev = get().peelCenter;
    const changed = (prev?.[0] !== peelCenter?.[0]) || (prev?.[1] !== peelCenter?.[1]) || (prev?.[2] !== peelCenter?.[2]);
    if (changed) get().pushHistory();
    set({ peelCenter, peelRadius: peelRadius ?? get().peelRadius });
  },
  setPeelRadius: (peelRadius) => set({ peelRadius }),
  select: (selectedId, point) =>
    set({
      selectedId,
      isolated: false,
      familyOn: false,
      selectedPoint: selectedId ? (point ?? get().selectedPoint) : null,
    }),
  hover: (hoveredId) => set({ hoveredId }),
  toggleIsolate: () => set({ isolated: !get().isolated, familyOn: false }),
  hideSelected: () => {
    const id = get().selectedId;
    if (!id) return;
    get().pushHistory();
    const hidden = new Set(get().hidden);
    hidden.add(id);
    set({
      hidden,
      selectedId: null,
      isolated: false,
      familyOn: false,
      hiddenStack: [...get().hiddenStack, id],
    });
  },
  undoHide: () => {
    const stack = [...get().hiddenStack];
    const id = stack.pop();
    if (!id) return;
    const hidden = new Set(get().hidden);
    hidden.delete(id);
    set({ hidden, hiddenStack: stack, selectedId: id, isolated: false, familyOn: false });
  },
  focusSelection: () => {
    const point = get().selectedPoint ?? get().peelCenter;
    if (!point) return;
    set({ cameraGoal: { target: point, distance: 0.28 } });
  },
  goAdjacentRegion: (dir) => {
    const ids = Object.keys(REGIONS) as RegionId[];
    const i = ids.indexOf(get().region);
    const next = ids[(i + dir + ids.length) % ids.length];
    get().goRegion(next);
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
    if (eye) {
      set({ cameraGoal: { eye, target } });
      return;
    }
    set({ cameraGoal: { target, distance: 0.46 } });
  },
  goRegion: (id) => {
    get().pushHistory();
    set(applyRegionPatch(id));
  },
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
      demoIndex: null,
      photoreal: true,
      isolated: false,
      familyOn: false,
      selectedId: null,
      ...applyRegionPatch(step.region),
      explode: step.explode,
      dissection: step.dissection ?? REGIONS[step.region].dissection,
    });
  },
  startTour: () => {
    get().pushHistory();
    get().applyTourStep(0);
  },
  nextTour: () => {
    const current = get().tourIndex ?? -1;
    get().applyTourStep(current + 1);
  },
  prevTour: () => {
    const current = get().tourIndex;
    if (current === null) return;
    if (current <= 0) {
      get().stopTour();
      get().goRegion("full");
      return;
    }
    get().applyTourStep(current - 1);
  },
  stopTour: () => set({ tourIndex: null }),
  applyDemoStep: (index) => {
    const step = DEMO[index];
    if (!step) {
      set({ demoIndex: null, xrayOn: false, clipMode: "off", clipEnabled: false, explode: 0 });
      get().goRegion("full");
      return;
    }
    const region = REGIONS[step.region];
    set({
      demoIndex: index,
      tourIndex: null,
      photoreal: true,
      isolated: false,
      familyOn: false,
      selectedId: null,
      selectedPoint: null,
      xrayOn: Boolean(step.xray),
      clipMode: step.clipMode,
      clipEnabled: step.clipMode !== "off",
      clipY: step.clipY ?? get().clipY,
      explode: step.explode,
      dissection: step.dissection,
      region: step.region,
      cameraGoal: { eye: region.eye, target: region.target },
      brainFocus: step.region === "head",
      pelvisFocus: step.region === "pelvis",
      peelCenter: step.peel === undefined ? region.peel : step.peel,
      peelRadius: 0.16,
      showLabels: false,
    });
  },
  startDemo: () => {
    get().pushHistory();
    get().applyDemoStep(0);
  },
  nextDemo: () => {
    const current = get().demoIndex ?? -1;
    get().applyDemoStep(current + 1);
  },
  prevDemo: () => {
    const current = get().demoIndex;
    if (current === null) return;
    if (current <= 0) {
      get().stopDemo();
      get().goRegion("full");
      return;
    }
    get().applyDemoStep(current - 1);
  },
  stopDemo: () => set({ demoIndex: null, xrayOn: false }),
  toggleLabels: () => set({ showLabels: !get().showLabels }),
  pinSelection: () => {
    const id = get().selectedId;
    const point = get().selectedPoint;
    if (!id || !point) return;
    const pinned = get().pinned;
    if (pinned.some((p) => p.id === id)) {
      set({ pinned: pinned.filter((p) => p.id !== id) });
      return;
    }
    set({ pinned: [...pinned, { id, point }], showLabels: true });
  },
  resetView: () =>
    set({
      dissection: 0,
      explode: 0,
      clipEnabled: false,
      clipY: 1.8,
      clipMode: "off" as ClipMode,
      contextOn: true,
      pathwayOn: true,
      xrayOn: false,
      familyOn: false,
      peelCenter: null,
      selectedId: null,
      selectedPoint: null,
      isolated: false,
      hidden: new Set(),
      hiddenStack: [],
      brainFocus: false,
      pelvisFocus: false,
      photoreal: true,
      systemOn: defaultSystems,
      cameraGoal: { eye: REGIONS.full.eye, target: REGIONS.full.target },
      region: "full",
      tourIndex: null,
      demoIndex: null,
      mobileTab: "view",
      pinned: [],
      showLabels: false,
      history: [],
      affect: 0,
      arousal: 0,
      touchZone: null,
    }),
  setTheme: (theme) => set({ theme }),
  setLightingPreset: (lightingPreset) => set({ lightingPreset }),
  setQualityMode: (qualityMode) => set({ qualityMode }),
  togglePhysiology: () => set({ physiologyOn: !get().physiologyOn }),
  setPhysiologyIntensity: (physiologyIntensity) =>
    set({ physiologyIntensity: Math.min(1, Math.max(0, physiologyIntensity)) }),
  toggleBreathing: () => set({ breathingOn: !get().breathingOn }),
  setLiving: (patch) =>
    set({
      affect: patch.affect ?? get().affect,
      arousal: patch.arousal ?? get().arousal,
      touchZone: patch.touchZone === undefined ? get().touchZone : patch.touchZone,
    }),
  pushHistory: () => {
    const cur = takeSnap(get());
    const hist = get().history;
    const last = hist[hist.length - 1];
    if (last && JSON.stringify(last) === JSON.stringify(cur)) return;
    set({ history: [...hist, cur].slice(-20) });
  },
  cycleClip: () => get().setClipMode(nextClipMode(get().clipMode)),
  closePeel: () => {
    get().pushHistory();
    set({
      peelCenter: null,
      dissection: get().dissection < 0.28 ? 0 : get().dissection,
    });
  },
  undoView: () => {
    const hist = [...get().history];
    const prev = hist.pop();
    if (!prev) {
      get().undoHide();
      return;
    }
    set({
      dissection: prev.dissection,
      explode: prev.explode,
      clipY: prev.clipY,
      clipEnabled: prev.clipEnabled,
      clipMode: prev.clipMode,
      peelCenter: prev.peelCenter,
      peelRadius: prev.peelRadius,
      selectedId: prev.selectedId,
      selectedPoint: prev.selectedPoint,
      isolated: prev.isolated,
      familyOn: prev.familyOn,
      xrayOn: prev.xrayOn,
      hidden: new Set(prev.hidden),
      region: prev.region,
      photoreal: prev.photoreal,
      history: hist,
      brainFocus: prev.region === "head",
      pelvisFocus: prev.region === "pelvis",
    });
  },
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
