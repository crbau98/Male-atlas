"use client";

import { useState } from "react";
import { useAtlas } from "@/lib/atlas-store";

function chip(on: boolean) {
  return `min-h-11 flex-1 rounded-full px-3 text-xs ${
    on ? "bg-[#c4a46c] text-[#16140f]" : "border border-white/15 text-[#efece6]"
  }`;
}

export function MobileDock() {
  const dissection = useAtlas((s) => s.dissection);
  const setDissection = useAtlas((s) => s.setDissection);
  const setPeel = useAtlas((s) => s.setPeel);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const clipMode = useAtlas((s) => s.clipMode);
  const cycleClip = useAtlas((s) => s.cycleClip);
  const undoView = useAtlas((s) => s.undoView);
  const closePeel = useAtlas((s) => s.closePeel);
  const demoIndex = useAtlas((s) => s.demoIndex);
  const startDemo = useAtlas((s) => s.startDemo);
  const stopDemo = useAtlas((s) => s.stopDemo);
  const photoreal = useAtlas((s) => s.photoreal);
  const setPhotoreal = useAtlas((s) => s.setPhotoreal);
  const xrayOn = useAtlas((s) => s.xrayOn);
  const toggleXray = useAtlas((s) => s.toggleXray);
  const pathwayOn = useAtlas((s) => s.pathwayOn);
  const togglePathway = useAtlas((s) => s.togglePathway);
  const showLabels = useAtlas((s) => s.showLabels);
  const toggleLabels = useAtlas((s) => s.toggleLabels);
  const resetView = useAtlas((s) => s.resetView);
  const explode = useAtlas((s) => s.explode);
  const setExplode = useAtlas((s) => s.setExplode);
  const [more, setMore] = useState(false);

  const cutLabel =
    clipMode === "off" ? "Cut" : clipMode === "quarter" ? "¼" : clipMode === "hemi" ? "Hemi" : clipMode.slice(0, 3);

  return (
    <div className="pointer-events-auto space-y-2 rounded-2xl border border-white/10 bg-[#101218]/92 px-3 py-2 backdrop-blur-md">
      <label className="flex min-w-0 flex-col gap-1 text-[11px] tracking-wide text-[#b7b3aa] uppercase">
        Peel
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={dissection}
          onChange={(e) => {
            const v = Number(e.target.value);
            setDissection(v);
            if (v < 0.02) setPeel(null);
          }}
          className="h-8 accent-[#c4a46c]"
        />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={() => (demoIndex === null ? startDemo() : stopDemo())} className={chip(demoIndex !== null)}>
          Demo
        </button>
        <button type="button" onClick={cycleClip} className={chip(clipMode !== "off")}>
          {cutLabel}
        </button>
        <button type="button" onClick={undoView} className={chip(false)}>
          Undo
        </button>
        <button type="button" onClick={() => setMore((v) => !v)} className={chip(more)}>
          More
        </button>
      </div>
      {peelCenter ? (
        <button type="button" onClick={closePeel} className={`${chip(true)} w-full`}>
          Close peel
        </button>
      ) : null}
      {more ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPhotoreal(!photoreal)} className={chip(photoreal)}>
            Nude
          </button>
          <button type="button" onClick={toggleXray} className={chip(xrayOn)}>
            X-ray
          </button>
          <button type="button" onClick={togglePathway} className={chip(pathwayOn)}>
            Path
          </button>
          <button type="button" onClick={toggleLabels} className={chip(showLabels)}>
            Labels
          </button>
          <button type="button" onClick={resetView} className={chip(false)}>
            Reset
          </button>
          <label className="flex min-w-[7rem] flex-1 flex-col gap-1 text-[11px] tracking-wide text-[#b7b3aa] uppercase">
            Explode
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={explode}
              onChange={(e) => setExplode(Number(e.target.value))}
              className="h-8 accent-[#c4a46c]"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
