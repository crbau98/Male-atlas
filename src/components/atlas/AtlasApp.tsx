"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAtlas } from "@/lib/atlas-store";
import type { AppearanceId } from "@/lib/types";
import { useIsPhone } from "@/lib/use-is-phone";
import { AppearanceSelect, AppearanceStrip } from "./AppearanceSelect";
import { InstallHint } from "./InstallHint";
import { LayerBar } from "./LayerBar";
import { RegionRail } from "./RegionRail";
import { AtlasLoader } from "./AtlasLoader";
import { LivingHud } from "./LivingHud";
import { CoachHint } from "./CoachHint";
import { MobileDock } from "./MobileDock";
import { applyViewFromUrl } from "@/lib/view-link";

const LOOKS: AppearanceId[] = ["julian", "malik", "kenji", "diego"];
const LOOK_KEY = "male-atlas-look";
const EXPERIENCE_KEY = "male-atlas-experience-v1";

const AtlasCanvas = dynamic(
  () => import("./AtlasCanvas").then((m) => m.AtlasCanvas),
  { ssr: false, loading: () => <div className="h-full bg-[#07080c]" /> },
);

export function AtlasApp() {
  const appearanceId = useAtlas((s) => s.appearanceId);
  const setAppearance = useAtlas((s) => s.setAppearance);
  const resetView = useAtlas((s) => s.resetView);
  const goRegion = useAtlas((s) => s.goRegion);
  const theme = useAtlas((s) => s.theme);
  const phone = useIsPhone();

  useEffect(() => {
    const saved = window.localStorage.getItem(LOOK_KEY);
    if (saved && LOOKS.includes(saved as AppearanceId)) {
      useAtlas.setState({ appearanceId: saved as AppearanceId });
    }
  }, []);

  useEffect(() => {
    if (appearanceId) window.localStorage.setItem(LOOK_KEY, appearanceId);
  }, [appearanceId]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EXPERIENCE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<ReturnType<typeof useAtlas.getState>>;
        useAtlas.setState({
          theme: saved.theme === "light" ? "light" : "dark",
          lightingPreset:
            saved.lightingPreset === "clinical" || saved.lightingPreset === "dramatic"
              ? saved.lightingPreset
              : "museum",
          qualityMode:
            saved.qualityMode === "balanced" || saved.qualityMode === "high"
              ? saved.qualityMode
              : "auto",
          physiologyOn: saved.physiologyOn !== false,
          physiologyIntensity:
            typeof saved.physiologyIntensity === "number" ? saved.physiologyIntensity : 0.85,
          breathingOn: saved.breathingOn !== false,
        });
      }
    } catch {
      window.localStorage.removeItem(EXPERIENCE_KEY);
    }

    return useAtlas.subscribe((state, previous) => {
      if (
        state.theme === previous.theme &&
        state.lightingPreset === previous.lightingPreset &&
        state.qualityMode === previous.qualityMode &&
        state.physiologyOn === previous.physiologyOn &&
        state.physiologyIntensity === previous.physiologyIntensity &&
        state.breathingOn === previous.breathingOn
      ) {
        return;
      }
      window.localStorage.setItem(
        EXPERIENCE_KEY,
        JSON.stringify({
          theme: state.theme,
          lightingPreset: state.lightingPreset,
          qualityMode: state.qualityMode,
          physiologyOn: state.physiologyOn,
          physiologyIntensity: state.physiologyIntensity,
          breathingOn: state.breathingOn,
        }),
      );
    });
  }, []);

  useEffect(() => {
    applyViewFromUrl();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAppearance(null);
      if (event.key === "r" || event.key === "R") resetView();
      if (event.key === "1") goRegion("pelvis");
      if (event.key === "2") goRegion("close");
      if (event.key === "3") goRegion("angle");
      if (event.key === "4") goRegion("full");
      if (event.key === "a" || event.key === "A") {
        const cur = useAtlas.getState().arousal;
        const next = cur > 0.85 ? 0 : cur + 0.35;
        useAtlas.getState().setLiving({ arousal: Math.min(1, next) });
      }
      if (event.key === "f" || event.key === "F") {
        useAtlas.getState().setLiving({ arousal: 0 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goRegion, resetView, setAppearance]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  if (!appearanceId) return <AppearanceSelect />;

  if (phone) {
    return (
      <div
        data-atlas-theme={theme}
        className="atlas-shell flex h-dvh flex-col overflow-hidden text-[var(--atlas-foreground)]"
      >
        <div className="relative min-h-0 flex-1">
          <AtlasCanvas />
          <AtlasLoader />
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
          <div className="pointer-events-none absolute inset-x-3 top-16 flex max-h-[34vh] flex-col items-start gap-2 overflow-y-auto">
            <CoachHint />
            <LivingHud />
          </div>
          <RegionRail />
        </div>
        <div className="atlas-bottom shrink-0 space-y-2 border-t border-white/10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          <MobileDock />
          <InstallHint />
        </div>
      </div>
    );
  }

  return (
    <div
      data-atlas-theme={theme}
      className="atlas-shell relative h-dvh overflow-hidden text-[var(--atlas-foreground)]"
    >
      <AtlasCanvas />
      <AtlasLoader />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6">
        <div className="flex items-start justify-end gap-4">
          <div className="flex w-80 flex-col items-end gap-3">
            <button
              type="button"
              onClick={() => setAppearance(null)}
              className="pointer-events-auto rounded-full border border-white/15 bg-[#101218]/80 px-3 py-1.5 text-xs tracking-wide uppercase"
            >
              Appearances
            </button>
            <LivingHud />
          </div>
        </div>
        <div className="flex justify-center">
          <LayerBar />
        </div>
      </div>
      <RegionRail />
    </div>
  );
}
