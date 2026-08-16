"use client";

import { findPart } from "@/lib/catalog";
import { useAtlas } from "@/lib/atlas-store";

export function HoverChip() {
  const hoveredId = useAtlas((s) => s.hoveredId);
  const selectedId = useAtlas((s) => s.selectedId);
  const part = findPart(hoveredId);
  if (!part || hoveredId === selectedId) return null;
  return (
    <div className="pointer-events-none rounded-full border border-white/10 bg-[#101218]/80 px-3 py-1 text-[11px] tracking-wide text-[#efece6] backdrop-blur-md">
      {part.name}
    </div>
  );
}
