"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import catalog from "@/data/catalog.json";
import { useAtlas } from "@/lib/atlas-store";
import { AppearanceSelect } from "./AppearanceSelect";
import { Inspector } from "./Inspector";
import { LayerBar } from "./LayerBar";
import { StructureTree } from "./StructureTree";

const AtlasCanvas = dynamic(
  () => import("./AtlasCanvas").then((m) => m.AtlasCanvas),
  { ssr: false, loading: () => <div className="h-full bg-[#07080c]" /> },
);

export function AtlasApp() {
  const appearanceId = useAtlas((s) => s.appearanceId);
  const setAppearance = useAtlas((s) => s.setAppearance);
  const resetView = useAtlas((s) => s.resetView);
  const toggleIsolate = useAtlas((s) => s.toggleIsolate);
  const hideSelected = useAtlas((s) => s.hideSelected);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAppearance(null);
      if (event.key === "r" || event.key === "R") resetView();
      if (event.key === "x" || event.key === "X") toggleIsolate();
      if (event.key === "h" || event.key === "H") hideSelected();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hideSelected, resetView, setAppearance, toggleIsolate]);

  if (!appearanceId) return <AppearanceSelect />;

  return (
    <div className="relative h-dvh overflow-hidden bg-[#07080c] text-[#efece6]">
      <AtlasCanvas />
      {catalog.meta.partCount === 0 ? (
        <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
          <p className="rounded-full border border-[#c4a46c]/40 bg-black/70 px-4 py-2 text-xs tracking-wide text-[#d9c59a]">
            Anatomy meshes not built yet — run python3 scripts/ingest_bodyparts3d.py
          </p>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <StructureTree />
          <div className="flex flex-col items-end gap-3">
            <button
              type="button"
              onClick={() => setAppearance(null)}
              className="pointer-events-auto rounded-full border border-white/15 bg-[#101218]/80 px-3 py-1.5 text-xs tracking-wide uppercase"
            >
              Appearances
            </button>
            <Inspector />
          </div>
        </div>
        <div className="flex justify-center">
          <LayerBar />
        </div>
      </div>
    </div>
  );
}
