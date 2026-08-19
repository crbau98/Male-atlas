"use client";

import { useEffect, useState } from "react";
import { haptic } from "@/lib/haptics";

const KEY = "male-atlas-hint-v4";

export function CoachHint() {
  const [dismissed, setDismissed] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(KEY)) return;
    const id = window.setTimeout(() => setAllowed(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  if (!allowed || dismissed) return null;

  return (
    <div className="pointer-events-auto max-w-[16rem] rounded-2xl border border-white/10 bg-[#101218]/90 px-3 py-2 text-[12px] leading-5 text-[#efece6] shadow-lg backdrop-blur-md">
      <p className="text-[10px] tracking-[0.2em] text-[#c4a46c] uppercase">Sexual arousal physiology</p>
      <p className="mt-1">
        Touch and stroke the male genitalia or body to trigger physiological erection, vascular flush, glans engorgement, and scrotal contraction.
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
