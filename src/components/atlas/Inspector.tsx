"use client";

import { catalog, findPart } from "@/lib/catalog";
import { describePart } from "@/lib/descriptions";
import { useAtlas } from "@/lib/atlas-store";
import { SYSTEM_META, type SystemId } from "@/lib/systems";

export function Inspector() {
  const selectedId = useAtlas((s) => s.selectedId);
  const hoveredId = useAtlas((s) => s.hoveredId);
  const isolate = useAtlas((s) => s.toggleIsolate);
  const hideSelected = useAtlas((s) => s.hideSelected);
  const isolated = useAtlas((s) => s.isolated);
  const id = selectedId ?? hoveredId;
  const part = findPart(id);

  if (!part) {
    return (
      <aside className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-[#101218]/88 p-5 text-sm text-[#b7b3aa] backdrop-blur-md">
        <p className="text-xs tracking-[0.22em] text-[#c4a46c] uppercase">
          Inspector
        </p>
        <h2 className="mt-2 font-serif text-2xl text-[#efece6]">
          Click through the living surface
        </h2>
        <p className="mt-3 leading-6">
          Drag to orbit. Tap the photoreal body to open an anatomical window.
          Raise dissection to peel skin, muscle, viscera, vessels, then bone and
          brain. {catalog.meta.partCount || "—"} named meshes from BodyParts3D.
        </p>
      </aside>
    );
  }

  const system = SYSTEM_META[part.system as SystemId];

  return (
    <aside className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-[#101218]/88 p-5 text-sm text-[#b7b3aa] backdrop-blur-md">
      <p className="text-xs tracking-[0.22em] text-[#c4a46c] uppercase">
        {system?.label ?? part.system}
      </p>
      <h2 className="mt-2 font-serif text-2xl leading-tight text-[#efece6]">
        {part.name}
      </h2>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-[#7d796f]">FMA</dt>
        <dd className="text-[#efece6]">{part.fmaId}</dd>
        <dt className="text-[#7d796f]">Mesh</dt>
        <dd className="font-mono text-[#efece6]">{part.id}</dd>
        <dt className="text-[#7d796f]">Side</dt>
        <dd className="text-[#efece6]">{part.laterality}</dd>
        {part.triangles ? (
          <>
            <dt className="text-[#7d796f]">Faces</dt>
            <dd className="text-[#efece6]">{part.triangles.toLocaleString()}</dd>
          </>
        ) : null}
      </dl>
      <p className="mt-4 leading-6">
        {describePart(part.name, part.system, part.fmaId)}
      </p>
      {part.aliases.length > 0 ? (
        <p className="mt-3 text-xs leading-5">
          Also represented as {part.aliases.slice(0, 6).join(", ")}
          {part.aliases.length > 6 ? "…" : ""}.
        </p>
      ) : null}
      {selectedId ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={isolate}
            className="min-h-11 rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#efece6] hover:border-[#c4a46c]"
          >
            {isolated ? "Show neighbors" : "Isolate"}
          </button>
          <button
            type="button"
            onClick={hideSelected}
            className="min-h-11 rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#efece6] hover:border-[#c4a46c]"
          >
            Hide
          </button>
        </div>
      ) : null}
    </aside>
  );
}
