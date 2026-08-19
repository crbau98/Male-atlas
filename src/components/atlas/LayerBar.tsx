"use client";

import { useState } from "react";
import { useAtlas } from "@/lib/atlas-store";
import { captureView } from "@/lib/screenshot";
import { shareCurrentView } from "@/lib/view-link";
import { AppearanceStrip } from "./AppearanceSelect";
import { ExperienceControls } from "./ExperienceControls";

export function LayerBar({ compact = false }: { compact?: boolean }) {
  const arousal = useAtlas((s) => s.arousal);
  const setLiving = useAtlas((s) => s.setLiving);
  const resetView = useAtlas((s) => s.resetView);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 1800);
  };

  const onShare = async () => {
    const result = await shareCurrentView();
    if (result === "shared") return;
    if (result === "copied") flash("Link copied");
    else flash("Couldn't share");
  };

  const onSnapshot = async () => {
    const result = await captureView();
    if (result === "shared") return;
    if (result === "downloaded") flash("Image saved");
    else flash("Couldn't capture");
  };

  const chip = (on: boolean) =>
    `min-h-10 rounded-full px-4 py-1.5 text-xs font-medium transition ${
      on
        ? "bg-[#c4a46c] text-[#16140f] shadow-md"
        : "border border-white/15 text-[#efece6] hover:bg-white/10"
    }`;

  return (
    <div className="atlas-panel pointer-events-auto flex max-w-4xl w-full flex-col gap-3 rounded-2xl border border-white/10 bg-[#101218]/90 px-4 py-3 backdrop-blur-md shadow-2xl">
      {toast ? (
        <p className="w-full rounded-full bg-[#c4a46c]/15 px-3 py-1 text-center text-[11px] text-[#c4a46c]">
          {toast}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {compact ? null : <AppearanceStrip />}
        </div>

        <div className="flex flex-1 items-center gap-4 min-w-[14rem] max-w-md px-2">
          <label className="flex flex-1 items-center gap-2 text-[10px] tracking-wide text-[#b7b3aa] uppercase">
            <span className="w-14 shrink-0 font-medium text-[#c4a46c]">Erection</span>
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = arousal > 0.85 ? 0 : arousal + 0.35;
              setLiving({ arousal: Math.min(1, next) });
            }}
            className={chip(arousal > 0.1)}
          >
            Arousal +
          </button>
          <button
            type="button"
            onClick={() => {
              setLiving({ arousal: 0 });
            }}
            className={chip(arousal === 0)}
          >
            Flaccid
          </button>
          <button type="button" onClick={onSnapshot} className={chip(false)}>
            Snapshot
          </button>
          <button type="button" onClick={onShare} className={chip(false)}>
            Share
          </button>
          <button type="button" onClick={resetView} className={chip(false)}>
            Reset
          </button>
        </div>
      </div>

      <details className="w-full">
        <summary className="min-h-9 cursor-pointer list-none rounded-xl border border-white/10 px-3 py-1.5 text-[10px] tracking-[0.16em] text-[var(--atlas-accent)] uppercase hover:bg-white/5 transition">
          Sexual physiology & studio lighting
        </summary>
        <div className="mt-2">
          <ExperienceControls />
        </div>
      </details>
    </div>
  );
}
