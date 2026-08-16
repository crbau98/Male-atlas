"use client";

import { useEffect, useState } from "react";
import { useAtlas } from "@/lib/atlas-store";
import { haptic } from "@/lib/haptics";

const KEY = "male-atlas-hint-v1";

export function CoachHint() {
  const peelCenter = useAtlas((s) => s.peelCenter);
  const dissection = useAtlas((s) => s.dissection);
  const [dismissed, setDismissed] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(KEY)) return;
    const id = window.setTimeout(() => setAllowed(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  const hide = Boolean(peelCenter) || dissection > 0.08;
  if (hide && allowed) {
    window.localStorage.setItem(KEY, "1");
  }
  if (!allowed || dismissed || hide) return null;

  return (
    <div className="pointer-events-auto max-w-[16rem] rounded-2xl border border-white/10 bg-[#101218]/90 px-3 py-2 text-[12px] leading-5 text-[#efece6] shadow-lg backdrop-blur-md">
      <p className="text-[10px] tracking-[0.2em] text-[#c4a46c] uppercase">How to look</p>
      <p className="mt-1">Drag to turn. Tap to peel. Hold to open wider. Double-tap empty space to reset.</p>
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
