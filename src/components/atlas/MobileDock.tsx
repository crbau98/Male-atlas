"use client";

import { useState } from "react";
import { useAtlas } from "@/lib/atlas-store";
import { haptic } from "@/lib/haptics";
import { captureView } from "@/lib/screenshot";
import { shareCurrentView } from "@/lib/view-link";
import { ExperienceControls } from "./ExperienceControls";

function chip(on: boolean) {
  return `min-h-11 flex-1 rounded-full px-3 text-xs font-medium transition ${
    on
      ? "bg-[#c4a46c] text-[#16140f] shadow-md"
      : "border border-white/15 text-[#efece6] hover:bg-white/10"
  }`;
}

export function MobileDock() {
  const arousal = useAtlas((s) => s.arousal);
  const setLiving = useAtlas((s) => s.setLiving);
  const resetView = useAtlas((s) => s.resetView);
  const [more, setMore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 1800);
  };

  const tap = (fn: () => void) => () => {
    haptic(8);
    fn();
  };

  const onShare = async () => {
    haptic(8);
    const result = await shareCurrentView();
    if (result === "shared") return;
    if (result === "copied") flash("Link copied");
    else flash("Couldn't share");
  };

  const onSnapshot = async () => {
    haptic(8);
    const result = await captureView();
    if (result === "shared") return;
    if (result === "downloaded") flash("Image saved");
    else flash("Couldn't capture");
  };

  return (
    <div
      className={`atlas-panel pointer-events-auto space-y-2 rounded-2xl border border-white/10 bg-[#101218]/90 px-3 py-2.5 backdrop-blur-md ${
        more ? "max-h-[50vh] overflow-y-auto overscroll-contain" : ""
      }`}
    >
      {toast ? (
        <p className="rounded-full bg-[#c4a46c]/15 px-3 py-1 text-center text-[11px] text-[#c4a46c]">
          {toast}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={tap(() => {
            const next = arousal > 0.85 ? 0 : arousal + 0.35;
            setLiving({ arousal: Math.min(1, next) });
          })}
          className={chip(arousal > 0.1)}
        >
          {arousal > 0.1 ? `Arousal ${Math.round(arousal * 100)}%` : "Arousal +"}
        </button>
        <button
          type="button"
          onClick={tap(() => {
            setLiving({ arousal: 0 });
          })}
          className={chip(arousal === 0)}
        >
          Flaccid
        </button>
        <button type="button" onClick={onSnapshot} className={chip(false)}>
          Snap
        </button>
        <button type="button" onClick={tap(() => setMore((v) => !v))} className={chip(more)}>
          Controls
        </button>
      </div>

      <div className="flex items-center gap-2 px-1 pt-1">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-[10px] tracking-wide text-[#b7b3aa] uppercase">
          <span className="w-14 shrink-0 text-[#c4a46c]">Erection</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={arousal}
            onChange={(e) => setLiving({ arousal: Number(e.target.value) })}
            className="h-7 w-full accent-[#c4a46c]"
          />
          <span className="w-8 shrink-0 text-right">{Math.round(arousal * 100)}%</span>
        </label>
      </div>

      {more ? (
        <div className="flex flex-wrap gap-2 pt-2">
          <ExperienceControls />
          <button type="button" onClick={onShare} className={chip(false)}>
            Share View
          </button>
          <button type="button" onClick={tap(resetView)} className={chip(false)}>
            Reset View
          </button>
        </div>
      ) : null}
    </div>
  );
}
