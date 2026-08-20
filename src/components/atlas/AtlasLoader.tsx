"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

export function AtlasLoader() {
  const { active, progress, loaded, total } = useProgress();
  const [slow, setSlow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const pct = Math.min(100, Math.max(0, progress || 0));
  const done = dismissed || initialLoadComplete;

  useEffect(() => {
    const slowId = window.setTimeout(() => setSlow(true), 8000);
    const openId = window.setTimeout(() => setInitialLoadComplete(true), 14000);
    return () => {
      window.clearTimeout(slowId);
      window.clearTimeout(openId);
    };
  }, []);

  useEffect(() => {
    if (initialLoadComplete) return;
    if (pct >= 98 || (!active && loaded >= 1)) {
      const id = window.setTimeout(() => setInitialLoadComplete(true), 160);
      return () => window.clearTimeout(id);
    }
  }, [active, initialLoadComplete, loaded, pct]);

  if (done) return null;

  return (
    <div className={`absolute inset-0 z-30 grid place-items-center bg-[#07080c]/92 ${slow ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className="w-[min(18rem,80vw)] text-center">
        <p className="text-[10px] tracking-[0.28em] text-[#c4a46c] uppercase">Male Atlas</p>
        <p className="mt-2 font-serif text-2xl text-[#efece6]">Loading the body</p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-[#c4a46c] transition-[width] duration-200" style={{ width: `${Math.max(8, pct)}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-[#9a958c]">
          {slow
            ? "Still preparing 3D. You can continue — the body will appear as it finishes."
            : total > 0
              ? `${loaded}/${total} · ${pct.toFixed(0)}%`
              : "Opening 3D…"}
        </p>
        {slow ? (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 flex-1 rounded-full border border-white/15 text-xs text-[#efece6]"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="min-h-11 flex-1 rounded-full bg-[#c4a46c] text-xs text-[#17130d]"
            >
              Continue
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
