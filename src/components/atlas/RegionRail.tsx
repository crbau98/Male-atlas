"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAtlas } from "@/lib/atlas-store";

export function RegionRail() {
  const goAdjacentRegion = useAtlas((s) => s.goAdjacentRegion);
  const region = useAtlas((s) => s.region);
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1">
      <button
        type="button"
        aria-label="Previous region"
        onClick={() => goAdjacentRegion(-1)}
        className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-[#101218]/70 text-[#c4a46c] backdrop-blur-md"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        aria-label="Next region"
        onClick={() => goAdjacentRegion(1)}
        className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-[#101218]/70 text-[#c4a46c] backdrop-blur-md"
      >
        <ChevronRight size={22} />
      </button>
      <span className="sr-only">{region}</span>
    </div>
  );
}
