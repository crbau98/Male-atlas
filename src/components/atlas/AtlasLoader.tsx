"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

export function AtlasLoader() {
  const { active, progress, loaded, total } = useProgress();
  const [timedOut, setTimedOut] = useState(false);
  const pct = Math.min(100, Math.max(0, progress || 0));
  const done = timedOut || (!active && pct >= 100);

  useEffect(() => {
    const id = window.setTimeout(() => setTimedOut(true), 14000);
    return () => window.clearTimeout(id);
  }, []);

  if (done) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-[#07080c]/92">
      <div className="w-[min(18rem,80vw)] text-center">
        <p className="text-[10px] tracking-[0.28em] text-[#c4a46c] uppercase">Male Atlas</p>
        <p className="mt-2 font-serif text-2xl text-[#efece6]">Loading the body</p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-[#c4a46c] transition-[width] duration-200" style={{ width: `${Math.max(8, pct)}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-[#9a958c]">
          {total > 0 ? `${loaded}/${total} · ${pct.toFixed(0)}%` : "Opening 3D…"}
        </p>
      </div>
    </div>
  );
}
