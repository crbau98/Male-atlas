"use client";

import { useMemo } from "react";
import { catalog } from "@/lib/catalog";
import { partMatches, useAtlas } from "@/lib/atlas-store";
import { revealPart } from "@/lib/reveal-part";
import { SYSTEM_META, SYSTEM_ORDER, type SystemId } from "@/lib/systems";
import type { CatalogPart } from "@/lib/types";

const parts = catalog.parts;

export function StructureTree() {
  const search = useAtlas((s) => s.search);
  const setSearch = useAtlas((s) => s.setSearch);
  const selectedId = useAtlas((s) => s.selectedId);
  const systemOn = useAtlas((s) => s.systemOn);
  const toggleSystem = useAtlas((s) => s.toggleSystem);

  const grouped = useMemo(() => {
    const q = search.trim();
    const filtered = q ? parts.filter((p) => partMatches(p, q)) : parts;
    const map = new Map<string, CatalogPart[]>();
    for (const part of filtered) {
      const list = map.get(part.system) ?? [];
      list.push(part);
      map.set(part.system, list);
    }
    return map;
  }, [search]);

  return (
    <aside className="pointer-events-auto flex h-full min-h-0 w-full flex-col rounded-2xl border border-white/10 bg-[#101218]/88 backdrop-blur-md">
      <div className="border-b border-white/10 p-4">
        <p className="text-xs tracking-[0.22em] text-[#c4a46c] uppercase">
          Structures
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gyrus, FMA, prostate…"
          className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-[#efece6] outline-none placeholder:text-[#6f6b63] focus:border-[#c4a46c]"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {SYSTEM_ORDER.filter((id) => grouped.has(id)).map((system) => {
          const list = grouped.get(system) ?? [];
          const meta = SYSTEM_META[system as SystemId];
          return (
            <details key={system} open={Boolean(search.trim()) || system === "nervous"}>
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#efece6] hover:bg-white/5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: meta.color }}
                />
                <span className="flex-1">{meta.label}</span>
                <span className="text-[11px] text-[#7d796f]">{list.length}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSystem(system);
                  }}
                  className={`text-[10px] tracking-wide uppercase ${
                    systemOn[system] === false ? "text-[#6f6b63]" : "text-[#c4a46c]"
                  }`}
                >
                  {systemOn[system] === false ? "Off" : "On"}
                </button>
              </summary>
              <ul className="mb-2 ml-4 border-l border-white/10">
                {list.slice(0, search.trim() ? 400 : 80).map((part) => (
                  <li key={part.id}>
                    <button
                      type="button"
                      onClick={() => revealPart(part.id)}
                      className={`block w-full truncate px-2 py-1 text-left text-xs ${
                        selectedId === part.id
                          ? "text-[#c4a46c]"
                          : "text-[#b7b3aa] hover:text-[#efece6]"
                      }`}
                    >
                      {part.name}
                    </button>
                  </li>
                ))}
                {list.length > 80 && !search.trim() ? (
                  <li className="px-2 py-1 text-[11px] text-[#7d796f]">
                    Search to list all {list.length} parts
                  </li>
                ) : null}
              </ul>
            </details>
          );
        })}
      </div>
    </aside>
  );
}
