"use client";

import { useAtlas } from "@/lib/atlas-store";
import { REGIONS, type RegionId } from "@/lib/regions";
import { AppearanceStrip } from "./AppearanceSelect";

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] tracking-wide text-[#b7b3aa] uppercase">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 accent-[#c4a46c]"
      />
    </label>
  );
}

export function LayerBar({ compact = false }: { compact?: boolean }) {
  const dissection = useAtlas((s) => s.dissection);
  const explode = useAtlas((s) => s.explode);
  const clipY = useAtlas((s) => s.clipY);
  const clipEnabled = useAtlas((s) => s.clipEnabled);
  const photoreal = useAtlas((s) => s.photoreal);
  const region = useAtlas((s) => s.region);
  const tourIndex = useAtlas((s) => s.tourIndex);
  const setDissection = useAtlas((s) => s.setDissection);
  const setExplode = useAtlas((s) => s.setExplode);
  const setClipY = useAtlas((s) => s.setClipY);
  const setClipEnabled = useAtlas((s) => s.setClipEnabled);
  const setPhotoreal = useAtlas((s) => s.setPhotoreal);
  const goRegion = useAtlas((s) => s.goRegion);
  const startTour = useAtlas((s) => s.startTour);
  const stopTour = useAtlas((s) => s.stopTour);
  const resetView = useAtlas((s) => s.resetView);
  const setPeel = useAtlas((s) => s.setPeel);
  const undoHide = useAtlas((s) => s.undoHide);
  const focusSelection = useAtlas((s) => s.focusSelection);
  const selectedId = useAtlas((s) => s.selectedId);

  const chip = (on: boolean) =>
    `min-h-11 rounded-full px-3 py-1.5 text-xs ${
      on ? "bg-[#c4a46c] text-[#16140f]" : "border border-white/15 text-[#efece6]"
    }`;

  return (
    <div className="pointer-events-auto flex w-full flex-wrap items-end gap-2 rounded-2xl border border-white/10 bg-[#101218]/88 px-4 py-3 backdrop-blur-md">
      {compact ? null : <AppearanceStrip />}
      <Slider
        label="Dissection"
        value={dissection}
        onChange={(v) => {
          setDissection(v);
          if (v < 0.02) setPeel(null);
        }}
      />
      <Slider label="Explode" value={explode} onChange={setExplode} />
      {compact ? null : (
        <Slider
          label="Clip height"
          value={clipY}
          min={0}
          max={1.8}
          onChange={(v) => {
            setClipY(v);
            setClipEnabled(true);
          }}
        />
      )}
      <div className="flex w-full flex-wrap gap-2">
        {(Object.keys(REGIONS) as RegionId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => goRegion(id)}
            className={chip(region === id)}
          >
            {REGIONS[id].label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => (tourIndex === null ? startTour() : stopTour())}
          className={chip(tourIndex !== null)}
        >
          Tour
        </button>
        <button type="button" onClick={() => setPhotoreal(!photoreal)} className={chip(photoreal)}>
          Nude
        </button>
        {compact ? null : (
          <button type="button" onClick={() => setClipEnabled(!clipEnabled)} className={chip(clipEnabled)}>
            Clip
          </button>
        )}
        <button type="button" onClick={resetView} className={chip(false)}>
          Reset
        </button>
        <button type="button" onClick={undoHide} className={chip(false)}>
          Undo hide
        </button>
        <button
          type="button"
          onClick={focusSelection}
          className={chip(Boolean(selectedId))}
        >
          Focus
        </button>
      </div>
    </div>
  );
}
