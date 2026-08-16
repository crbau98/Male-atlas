"use client";

import { useEffect, useState } from "react";
import { useAtlas } from "@/lib/atlas-store";
import { haptic } from "@/lib/haptics";

const KEY = "male-atlas-hint-v3";

export function CoachHint() {
  const peelCenter = useAtlas((s) => s.peelCenter);
  const dissection = useAtlas((s) => s.dissection);
  const [dismissed, setDismissed] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const hide = Boolean(peelCenter) || dissection > 0.08;

  useEffect(() => {
    if (window.localStorage.getItem(KEY)) return;
    const id = window.setTimeout(() => setAllowed(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (hide && allowed) window.localStorage.setItem(KEY, "1");
  }, [allowed, hide]);

  if (!allowed || dismissed || hide) return null;

  return (
    <div className="pointer-events-auto max-w-[16rem] rounded-2xl border border-white/10 bg-[#101218]/90 px-3 py-2 text-[12px] leading-5 text-[#efece6] shadow-lg backdrop-blur-md">
      <p className="text-[10px] tracking-[0.2em] text-[#c4a46c] uppercase">How to look</p>
      <p className="mt-1">
        Stroke the skin while you turn him. Face and chest warm; pelvis raises arousal.
        Tap to peel. Pinch to zoom. Three fingers move one layer deeper.
      </p>
      <button
        type="button"
        className="mt-1 text-[11px] text-[#c4a46c]"
        onClick={() => {
          haptic(8);
          window.localStorage.setItem(KEY, "1");
          setDismissed(true);
        }}
      >
        Got it
      </button>
    </div>
  );
}
