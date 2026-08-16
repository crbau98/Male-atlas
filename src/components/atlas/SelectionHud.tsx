"use client";

import { findPart } from "@/lib/catalog";
import { describePart } from "@/lib/descriptions";
import { useAtlas } from "@/lib/atlas-store";
import { TOUR } from "@/lib/regions";
import { SYSTEM_META, type SystemId } from "@/lib/systems";

export function SelectionHud() {
  const selectedId = useAtlas((s) => s.selectedId);
  const isolated = useAtlas((s) => s.isolated);
  const tourIndex = useAtlas((s) => s.tourIndex);
  const toggleIsolate = useAtlas((s) => s.toggleIsolate);
  const hideSelected = useAtlas((s) => s.hideSelected);
  const setMobileTab = useAtlas((s) => s.setMobileTab);
  const nextTour = useAtlas((s) => s.nextTour);
  const stopTour = useAtlas((s) => s.stopTour);
  const part = findPart(selectedId);
  const step = tourIndex !== null ? TOUR[tourIndex] : null;

  if (!part && !step) return null;

  return (
    <div className="pointer-events-auto max-w-sm rounded-2xl border border-white/10 bg-[#101218]/90 p-3 text-[#efece6] backdrop-blur-md">
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
        </div>
      ) : null}
      {part ? (
        <div>
          <p className="text-[10px] tracking-[0.22em] text-[#c4a46c] uppercase">
            {SYSTEM_META[part.system as SystemId]?.label ?? part.system}
          </p>
          <h3 className="font-serif text-xl leading-tight">{part.name}</h3>
          <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#b7b3aa]">
            {describePart(part.name, part.system, part.fmaId)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleIsolate}
              className="min-h-10 rounded-full border border-white/15 px-3 text-xs"
            >
              {isolated ? "Show all" : "Isolate"}
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
