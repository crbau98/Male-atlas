"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { catalog } from "@/lib/catalog";
import { useAtlas } from "@/lib/atlas-store";
import { useIsPhone } from "@/lib/use-is-phone";
import { AppearanceSelect, AppearanceStrip } from "./AppearanceSelect";
import { Inspector } from "./Inspector";
import { InstallHint } from "./InstallHint";
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
  const mobileTab = useAtlas((s) => s.mobileTab);
  const setMobileTab = useAtlas((s) => s.setMobileTab);
  const phone = useIsPhone();

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

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  if (!appearanceId) return <AppearanceSelect />;

  if (phone) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-[#07080c] text-[#efece6]">
        <div className="relative min-h-0 flex-1">
          <AtlasCanvas />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#101218]/80 px-2 py-1 backdrop-blur-md">
              <AppearanceStrip />
            </div>
            <button
              type="button"
              onClick={() => setAppearance(null)}
              className="pointer-events-auto min-h-11 rounded-full border border-white/15 bg-[#101218]/80 px-3 text-xs tracking-wide uppercase"
            >
              Looks
            </button>
          </div>
          {catalog.meta.partCount === 0 ? (
            <p className="absolute inset-x-4 top-20 rounded-full bg-black/70 px-3 py-2 text-center text-[11px] text-[#d9c59a]">
              Run python3 scripts/ingest_bodyparts3d.py
            </p>
          ) : null}
          <div className="pointer-events-none absolute inset-x-3 bottom-2">
            <InstallHint />
          </div>
        </div>
        <div className="shrink-0 space-y-2 border-t border-white/10 bg-[#0b0d12] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          {mobileTab === "view" ? <LayerBar compact /> : null}
          {mobileTab === "parts" ? (
            <div className="h-[42vh]">
              <StructureTree />
            </div>
          ) : null}
          {mobileTab === "info" ? (
            <div className="max-h-[42vh] overflow-y-auto">
              <Inspector />
            </div>
          ) : null}
          <nav className="grid grid-cols-3 gap-2">
            {(["view", "parts", "info"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMobileTab(tab)}
                className={`min-h-12 rounded-xl text-xs tracking-[0.18em] uppercase ${
                  mobileTab === tab ? "bg-[#c4a46c] text-[#16140f]" : "bg-white/5 text-[#b7b3aa]"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-[#07080c] text-[#efece6]">
      <AtlasCanvas />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="h-[min(78vh,760px)] w-80">
            <StructureTree />
          </div>
          <div className="flex w-80 flex-col items-end gap-3">
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
