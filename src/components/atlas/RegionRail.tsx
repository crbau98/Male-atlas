"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAtlas } from "@/lib/atlas-store";
import { useIsPhone } from "@/lib/use-is-phone";

export function RegionRail() {
  const goAdjacentRegion = useAtlas((s) => s.goAdjacentRegion);
  const region = useAtlas((s) => s.region);
  const phone = useIsPhone();
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 flex items-center justify-between px-1 ${
        phone ? "bottom-[18%] top-auto" : "inset-y-0"
      }`}
    >
      <button
        type="button"
        aria-label="Previous region"
        onClick={() => goAdjacentRegion(-1)}
        className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#101218]/70 text-[#c4a46c] backdrop-blur-md"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        aria-label="Next region"
        onClick={() => goAdjacentRegion(1)}
        className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#101218]/70 text-[#c4a46c] backdrop-blur-md"
      >
        <ChevronRight size={20} />
      </button>
      <span className="sr-only">{region}</span>
    </div>
  );
}
