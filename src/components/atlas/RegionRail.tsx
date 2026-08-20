"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAtlas } from "@/lib/atlas-store";
import { REGIONS } from "@/lib/regions";
import { useIsPhone } from "@/lib/use-is-phone";
import { haptic } from "@/lib/haptics";

export function RegionRail() {
  const goAdjacentRegion = useAtlas((s) => s.goAdjacentRegion);
  const region = useAtlas((s) => s.region);
  const phone = useIsPhone();
  const current = REGIONS[region] ?? REGIONS.pelvis;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 flex items-center justify-between px-3 ${
        phone ? "bottom-[19%] top-auto" : "inset-y-0"
      }`}
    >
      <button
        type="button"
        aria-label="Previous view angle"
        onClick={() => {
          haptic(7);
          goAdjacentRegion(-1);
        }}
        className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-[#101218]/80 text-[#c4a46c] shadow-lg backdrop-blur-md transition hover:bg-[#101218] hover:border-[#c4a46c]/50"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() => {
          haptic(7);
          goAdjacentRegion(1);
        }}
        className="pointer-events-auto rounded-full border border-white/10 bg-[#101218]/70 px-3 py-1 text-[11px] font-medium tracking-wide text-[#efece6] shadow-lg backdrop-blur-md transition hover:border-[#c4a46c]/40 hover:text-[#c4a46c]"
      >
        {current.label}
      </button>

      <button
        type="button"
        aria-label="Next view angle"
        onClick={() => {
          haptic(7);
          goAdjacentRegion(1);
        }}
        className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-[#101218]/80 text-[#c4a46c] shadow-lg backdrop-blur-md transition hover:bg-[#101218] hover:border-[#c4a46c]/50"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
