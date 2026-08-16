"use client";

import { findPart } from "@/lib/catalog";
import { describePart } from "@/lib/descriptions";
import { FIGURES } from "@/lib/figures";
import { useAtlas } from "@/lib/atlas-store";
import { tapPart } from "@/lib/tap-part";

export function FigurePlate() {
  const region = useAtlas((s) => s.region);
  const dissection = useAtlas((s) => s.dissection);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const selectedId = useAtlas((s) => s.selectedId);
  const showLabels = useAtlas((s) => s.showLabels);
  const part = findPart(selectedId);
  if (!showLabels) return null;
  if (dissection < 0.08 && !peelCenter && !part) return null;

  const plate =
    FIGURES.find((f) => f.id === selectedId)?.plate ??
    (region === "head"
      ? "Encephalon"
      : region === "chest"
        ? "Thorax"
        : region === "abdomen"
          ? "Abdomen"
          : region === "pelvis"
            ? "Pelvis"
            : "Adult male");

  const legend = FIGURES.filter(
    (fig) => fig.regions.includes(region) || (region === "full" && dissection > 0.35),
  );

  return (
    <div className="pointer-events-none max-w-sm rounded-sm border border-[#2a241c]/25 bg-[#f7f1e4]/92 p-3 text-[#1f1a14] shadow-md backdrop-blur-sm">
      <p className="text-[10px] tracking-[0.22em] text-[#8a1f1a] uppercase">
        Plate · {plate}
      </p>
      <h3 className="font-serif text-xl leading-tight">
        {part ? part.name : "Anatomical figure"}
      </h3>
      {part ? (
        <p className="mt-1 text-[11px] leading-5 text-[#4a4338]">
          {describePart(part.name, part.system, part.fmaId)} FMA {part.fmaId}.
        </p>
      ) : (
        <p className="mt-1 text-[11px] leading-5 text-[#4a4338]">
          Tap a numbered structure. Quarter and Hemi are textbook cuts. Pathway
          keeps the related tree lit; X-ray ghosts the rest.
        </p>
      )}
      {legend.length > 0 ? (
        <ol className="pointer-events-auto mt-2 space-y-1">
          {legend.map((fig, i) => (
            <li key={fig.id}>
              <button
                type="button"
                onClick={() => tapPart(fig.id, fig.position)}
                className={`flex w-full items-center gap-2 rounded-sm px-1 py-0.5 text-left text-[11px] ${
                  selectedId === fig.id ? "bg-[#8a1f1a]/10 text-[#8a1f1a]" : "text-[#4a4338]"
                }`}
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#8a1f1a] text-[9px] text-[#f7f1e4]">
                  {i + 1}
                </span>
                <span className="font-serif">{fig.label}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
