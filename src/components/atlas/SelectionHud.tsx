"use client";

import { findPart } from "@/lib/catalog";
import { describePart } from "@/lib/descriptions";
import { useAtlas } from "@/lib/atlas-store";
import { TOUR } from "@/lib/regions";
import { DEMO } from "@/lib/demo";
import { SYSTEM_META, type SystemId } from "@/lib/systems";
import { pathwayLabel } from "@/lib/pathways";

export function SelectionHud() {
  const selectedId = useAtlas((s) => s.selectedId);
  const isolated = useAtlas((s) => s.isolated);
  const tourIndex = useAtlas((s) => s.tourIndex);
  const demoIndex = useAtlas((s) => s.demoIndex);
  const toggleIsolate = useAtlas((s) => s.toggleIsolate);
  const toggleFamily = useAtlas((s) => s.toggleFamily);
  const familyOn = useAtlas((s) => s.familyOn);
  const hideSelected = useAtlas((s) => s.hideSelected);
  const undoHide = useAtlas((s) => s.undoHide);
  const focusSelection = useAtlas((s) => s.focusSelection);
  const pinSelection = useAtlas((s) => s.pinSelection);
  const pinned = useAtlas((s) => s.pinned);
  const setMobileTab = useAtlas((s) => s.setMobileTab);
  const nextTour = useAtlas((s) => s.nextTour);
  const prevTour = useAtlas((s) => s.prevTour);
  const stopTour = useAtlas((s) => s.stopTour);
  const nextDemo = useAtlas((s) => s.nextDemo);
  const prevDemo = useAtlas((s) => s.prevDemo);
  const stopDemo = useAtlas((s) => s.stopDemo);
  const part = findPart(selectedId);
  const step = tourIndex !== null ? TOUR[tourIndex] : null;
  const demo = demoIndex !== null ? DEMO[demoIndex] : null;
  const path = part ? pathwayLabel(part.name) : null;

  if (!part && !step && !demo) return null;

  return (
    <div className="pointer-events-auto max-w-sm rounded-2xl border border-white/10 bg-[#101218]/90 p-3 text-[#efece6] backdrop-blur-md">
      {demo ? (
        <div className="mb-2">
          <p className="text-[10px] tracking-[0.22em] text-[#c4a46c] uppercase">
            Demo {demoIndex! + 1}/{DEMO.length}
          </p>
          <h3 className="font-serif text-lg leading-tight">{demo.title}</h3>
          <p className="mt-1 text-xs leading-5 text-[#b7b3aa]">{demo.body}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={prevDemo} className="min-h-10 rounded-full border border-white/15 px-3 text-xs">
              Back
            </button>
            <button
              type="button"
              onClick={nextDemo}
              className="min-h-10 rounded-full bg-[#c4a46c] px-3 text-xs text-[#16140f]"
            >
              {demoIndex! + 1 >= DEMO.length ? "Finish" : "Next"}
            </button>
            <button type="button" onClick={stopDemo} className="min-h-10 rounded-full border border-white/15 px-3 text-xs">
              Skip
            </button>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#c4a46c] transition-all duration-700"
              style={{ width: `${((demoIndex! + 1) / DEMO.length) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
      {step ? (
        <div className="mb-2">
          <p className="text-[10px] tracking-[0.22em] text-[#c4a46c] uppercase">
            Tour {tourIndex! + 1}/{TOUR.length}
          </p>
          <h3 className="font-serif text-lg leading-tight">{step.title}</h3>
          <p className="mt-1 text-xs leading-5 text-[#b7b3aa]">{step.body}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={prevTour}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              Back
            </button>
            <button
              type="button"
              onClick={nextTour}
              className="min-h-10 rounded-full bg-[#c4a46c] px-3 text-xs text-[#16140f]"
            >
              {tourIndex! + 1 >= TOUR.length ? "Finish" : "Next"}
            </button>
            <button
              type="button"
              onClick={stopTour}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              Skip
            </button>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#c4a46c] transition-all duration-700"
              style={{ width: `${((tourIndex! + 1) / TOUR.length) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
      {part ? (
        <div>
          <p className="text-[10px] tracking-[0.22em] text-[#c4a46c] uppercase">
            {SYSTEM_META[part.system as SystemId]?.label ?? part.system}
            {path ? ` · ${path}` : ""}
          </p>
          <h3 className="font-serif text-xl leading-tight">{part.name}</h3>
          <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#b7b3aa]">
            {describePart(part.name, part.system, part.fmaId)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={focusSelection}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              Focus
            </button>
            <button
              type="button"
              onClick={pinSelection}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              {pinned.some((p) => p.id === selectedId) ? "Unpin" : "Pin label"}
            </button>
            <button
              type="button"
              onClick={toggleIsolate}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              {isolated ? "Show all" : "Isolate"}
            </button>
            <button
              type="button"
              onClick={toggleFamily}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              {familyOn ? "Family on" : "Family"}
            </button>
            <button
              type="button"
              onClick={hideSelected}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              Hide
            </button>
            <button
              type="button"
              onClick={undoHide}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("info")}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              Info
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
