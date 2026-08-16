"use client";

import { Html, Line } from "@react-three/drei";
import { findPart } from "@/lib/catalog";
import { FIGURES } from "@/lib/figures";
import { useAtlas } from "@/lib/atlas-store";
import { tapPart } from "@/lib/tap-part";

function Callout({
  id,
  label,
  index,
  position,
  active,
}: {
  id: string;
  label: string;
  index: number;
  position: [number, number, number];
  active: boolean;
}) {
  const side = index % 2 === 0 ? 1 : -1;
  const end: [number, number, number] = [
    position[0] + 0.18 * side,
    position[1] + 0.05 + (index % 4) * 0.025,
    position[2] + 0.03,
  ];

  return (
    <group>
      <Line
        points={[position, end]}
        color={active ? "#8a1f1a" : "#2a241c"}
        lineWidth={1.4}
        transparent
        opacity={0.85}
        depthTest={false}
      />
      <Html position={end} style={{ pointerEvents: "auto" }} zIndexRange={[20, 0]}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            tapPart(id, position);
          }}
          className={`flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-left shadow-sm ${
            active
              ? "border-[#8a1f1a] bg-[#f4ead8] text-[#5a1814]"
              : "border-[#2a241c]/40 bg-[#f7f1e4]/92 text-[#1f1a14]"
          }`}
        >
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[#8a1f1a] text-[9px] text-[#f7f1e4]">
            {index}
          </span>
          <span className="font-serif text-[11px] leading-none whitespace-nowrap">{label}</span>
        </button>
      </Html>
    </group>
  );
}

export function AnatomyCallouts() {
  const showLabels = useAtlas((s) => s.showLabels);
  const dissection = useAtlas((s) => s.dissection);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const region = useAtlas((s) => s.region);
  const selectedId = useAtlas((s) => s.selectedId);
  const selectedPoint = useAtlas((s) => s.selectedPoint);
  const pinned = useAtlas((s) => s.pinned);
  const isolated = useAtlas((s) => s.isolated);
  if (!showLabels || isolated) return null;
  const opened = dissection > 0.08 || Boolean(peelCenter);
  if (!opened && pinned.length === 0 && !selectedId) return null;

  const marks: Array<{ id: string; label: string; position: [number, number, number]; active: boolean }> = [];
  if (opened) {
    for (const fig of FIGURES) {
      if (fig.regions.includes(region) || (region === "full" && dissection > 0.35)) {
        marks.push({ id: fig.id, label: fig.label, position: fig.position, active: selectedId === fig.id });
      }
    }
  }
  for (const pin of pinned) {
    if (!marks.some((m) => m.id === pin.id)) {
      const part = findPart(pin.id);
      marks.push({
        id: pin.id,
        label: part?.name ?? pin.id,
        position: pin.point,
        active: selectedId === pin.id,
      });
    }
  }
  if (selectedId && selectedPoint && !marks.some((m) => m.id === selectedId)) {
    const part = findPart(selectedId);
    marks.push({
      id: selectedId,
      label: part?.name ?? selectedId,
      position: selectedPoint,
      active: true,
    });
  }

  return (
    <group>
      {marks.slice(0, 12).map((mark, i) => (
        <Callout
          key={`${mark.id}-${i}`}
          id={mark.id}
          label={mark.label}
          index={i + 1}
          position={mark.position}
          active={mark.active}
        />
      ))}
    </group>
  );
}
