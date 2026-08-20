"use client";

import { useAtlas } from "@/lib/atlas-store";
import { zoneLabel } from "@/lib/living-touch";

export function LivingHud() {
  const physiologyOn = useAtlas((s) => s.physiologyOn);
  const affect = useAtlas((s) => s.affect);
  const arousal = useAtlas((s) => s.arousal);
  const touchZone = useAtlas((s) => s.touchZone);
  if (!physiologyOn) return null;
  if (affect < 0.04 && arousal < 0.04) return null;

  return (
    <div className="pointer-events-none max-w-[15rem] rounded-2xl border border-white/10 bg-[#101218]/90 px-3.5 py-2.5 backdrop-blur-md shadow-xl">
      <p className="text-[10px] tracking-[0.2em] text-[#c4a46c] uppercase font-medium">Male sexual physiology</p>
      <p className="mt-1 text-[11px] leading-4 text-[#efece6] font-medium">{zoneLabel(touchZone)}</p>
      <p className="mt-1 text-[10px] leading-4 text-[#b7b3aa]">
        {arousal > 0.4
          ? "Penile erection, glans engorgement, scrotal dartos contraction"
          : "Vascular tumescence, tactile warmth, physiological arousal"}
      </p>
      <Meter label="Warmth" value={affect} color="#c4a46c" />
      <Meter label="Arousal" value={arousal} color="#c45a48" />
    </div>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-[9px] tracking-[0.14em] text-[#9a958c] uppercase">
        <span>{label}</span>
        <span>{Math.round(value * 100)}</span>
      </div>
      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-150"
          style={{ width: `${Math.round(value * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}
