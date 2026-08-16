"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { catalog } from "@/lib/catalog";
import { useAtlas } from "@/lib/atlas-store";
import type { AppearanceId } from "@/lib/types";
import { useIsPhone } from "@/lib/use-is-phone";
import { AppearanceSelect, AppearanceStrip } from "./AppearanceSelect";
import { Inspector } from "./Inspector";
import { InstallHint } from "./InstallHint";
import { LayerBar } from "./LayerBar";
import { HoverChip } from "./HoverChip";
import { FigurePlate } from "./FigurePlate";
import { RegionRail } from "./RegionRail";
import { SelectionHud } from "./SelectionHud";
import { StructureTree } from "./StructureTree";
import { AtlasLoader } from "./AtlasLoader";
import { CoachHint } from "./CoachHint";
import { MobileDock } from "./MobileDock";

const LOOKS: AppearanceId[] = ["julian", "malik", "kenji", "diego"];
const LOOK_KEY = "male-atlas-look";

const AtlasCanvas = dynamic(
  () => import("./AtlasCanvas").then((m) => m.AtlasCanvas),
  { ssr: false, loading: () => <div className="h-full bg-[#07080c]" /> },
);

export function AtlasApp() {
  const appearanceId = useAtlas((s) => s.appearanceId);
  const setAppearance = useAtlas((s) => s.setAppearance);
  const resetView = useAtlas((s) => s.resetView);
  const toggleIsolate = useAtlas((s) => s.toggleIsolate);
  const hideSelected = useAtlas((s) => s.hideSelected);
  const nextTour = useAtlas((s) => s.nextTour);
  const prevTour = useAtlas((s) => s.prevTour);
  const stopTour = useAtlas((s) => s.stopTour);
  const focusSelection = useAtlas((s) => s.focusSelection);
  const goRegion = useAtlas((s) => s.goRegion);
  const goAdjacentRegion = useAtlas((s) => s.goAdjacentRegion);
  const pinSelection = useAtlas((s) => s.pinSelection);
  const toggleLabels = useAtlas((s) => s.toggleLabels);
  const toggleContext = useAtlas((s) => s.toggleContext);
  const togglePathway = useAtlas((s) => s.togglePathway);
  const toggleXray = useAtlas((s) => s.toggleXray);
  const toggleFamily = useAtlas((s) => s.toggleFamily);
  const setClipMode = useAtlas((s) => s.setClipMode);
  const mobileTab = useAtlas((s) => s.mobileTab);
  const setMobileTab = useAtlas((s) => s.setMobileTab);
  const tourIndex = useAtlas((s) => s.tourIndex);
  const demoIndex = useAtlas((s) => s.demoIndex);
  const nextDemo = useAtlas((s) => s.nextDemo);
  const prevDemo = useAtlas((s) => s.prevDemo);
  const stopDemo = useAtlas((s) => s.stopDemo);
  const phone = useIsPhone();

  useEffect(() => {
    const saved = window.localStorage.getItem(LOOK_KEY);
    if (saved && LOOKS.includes(saved as AppearanceId)) {
      useAtlas.setState({ appearanceId: saved as AppearanceId });
    }
  }, []);

  useEffect(() => {
    if (appearanceId) window.localStorage.setItem(LOOK_KEY, appearanceId);
  }, [appearanceId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAppearance(null);
      if (event.key === "r" || event.key === "R") resetView();
      if (event.key === "x" || event.key === "X") toggleIsolate();
      if (event.key === "h" || event.key === "H") hideSelected();
      if (event.key === " " || event.key === "ArrowRight") {
        event.preventDefault();
        if (useAtlas.getState().demoIndex !== null) nextDemo();
        else nextTour();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (useAtlas.getState().demoIndex !== null) prevDemo();
        else prevTour();
      }
      if (event.key === "u" || event.key === "U") useAtlas.getState().undoView();
      if (event.key === "f" || event.key === "F") focusSelection();
      if (event.key === "[" ) goAdjacentRegion(-1);
      if (event.key === "]" ) goAdjacentRegion(1);
      if (event.key === "1") goRegion("full");
      if (event.key === "2") goRegion("head");
      if (event.key === "3") goRegion("chest");
      if (event.key === "4") goRegion("abdomen");
      if (event.key === "5") goRegion("pelvis");
      if (event.key === "p" || event.key === "P") pinSelection();
      if (event.key === "l" || event.key === "L") toggleLabels();
      if (event.key === "c" || event.key === "C") toggleContext();
      if (event.key === "y" || event.key === "Y") toggleXray();
      if (event.key === "w" || event.key === "W") togglePathway();
      if (event.key === "g" || event.key === "G") toggleFamily();
      if (event.key === "6") setClipMode("sagittal");
      if (event.key === "7") setClipMode("coronal");
      if (event.key === "8") setClipMode("axial");
      if (event.key === "9") setClipMode("quarter");
      if (event.key === "-") setClipMode("hemi");
      if (event.key === "0") setClipMode("off");
      if (event.key === "d" || event.key === "D") {
        const demoing = useAtlas.getState().demoIndex !== null;
        if (demoing) stopDemo();
        else useAtlas.getState().startDemo();
      }
      if (event.key === "t" || event.key === "T") {
        const touring = useAtlas.getState().tourIndex !== null;
        if (touring) stopTour();
        else useAtlas.getState().startTour();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusSelection, goAdjacentRegion, goRegion, hideSelected, nextDemo, nextTour, pinSelection, prevDemo, prevTour, resetView, setAppearance, setClipMode, stopDemo, stopTour, toggleContext, toggleFamily, toggleIsolate, toggleLabels, togglePathway, toggleXray]);

  useEffect(() => {
    if (tourIndex === null) return;
    const id = window.setTimeout(() => useAtlas.getState().nextTour(), 7200);
    return () => window.clearTimeout(id);
  }, [tourIndex]);

  useEffect(() => {
    if (demoIndex === null) return;
    const id = window.setTimeout(() => useAtlas.getState().nextDemo(), 6400);
    return () => window.clearTimeout(id);
  }, [demoIndex]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  if (!appearanceId) return <AppearanceSelect />;

  if (phone) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-[#07080c] text-[#efece6]">
        <div className="relative min-h-0 flex-1">
          <AtlasCanvas />
          <AtlasLoader />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#101218]/80 px-2 py-1 backdrop-blur-md">
              <AppearanceStrip />
            </div>
            <button
              type="button"
              onClick={() => setAppearance(null)}
              className="pointer-events-auto min-h-11 rounded-full border border-white/15 bg-[#101218]/80 px-3 text-xs tracking-wide uppercase"
            >
              Looks
            </button>
          </div>
          <div className="pointer-events-none absolute inset-x-3 top-16 flex max-h-[34vh] flex-col items-start gap-2 overflow-y-auto">
            <CoachHint />
            <SelectionHud />
          </div>
          <RegionRail />
          {catalog.meta.partCount === 0 ? (
            <p className="absolute inset-x-4 top-20 rounded-full bg-black/70 px-3 py-2 text-center text-[11px] text-[#d9c59a]">
              Run python3 scripts/ingest_bodyparts3d.py
            </p>
          ) : null}
        </div>
        <div className="shrink-0 space-y-2 border-t border-white/10 bg-[#0b0d12] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          {mobileTab === "view" ? (
            <>
              <MobileDock />
              <InstallHint />
            </>
          ) : null}
          {mobileTab === "parts" ? (
            <div className="h-[42vh]">
              <StructureTree />
            </div>
          ) : null}
          {mobileTab === "info" ? (
            <div className="max-h-[42vh] overflow-y-auto">
              <Inspector />
            </div>
          ) : null}
          <nav className="grid grid-cols-3 gap-2">
            {(["view", "parts", "info"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMobileTab(tab)}
                className={`min-h-12 rounded-xl text-xs tracking-[0.18em] uppercase ${
                  mobileTab === tab ? "bg-[#c4a46c] text-[#16140f]" : "bg-white/5 text-[#b7b3aa]"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-[#07080c] text-[#efece6]">
      <AtlasCanvas />
      <AtlasLoader />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="h-[min(78vh,760px)] w-80">
            <StructureTree />
          </div>
          <div className="flex w-80 flex-col items-end gap-3">
            <button
              type="button"
              onClick={() => setAppearance(null)}
              className="pointer-events-auto rounded-full border border-white/15 bg-[#101218]/80 px-3 py-1.5 text-xs tracking-wide uppercase"
            >
              Appearances
            </button>
            <SelectionHud />
            <FigurePlate />
            <HoverChip />
            <Inspector />
          </div>
        </div>
        <div className="flex justify-center">
          <LayerBar />
        </div>
      </div>
      <RegionRail />
    </div>
  );
}
