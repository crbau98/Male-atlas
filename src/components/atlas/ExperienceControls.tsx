"use client";

import { useAtlas, type AtlasTheme, type LightingPreset, type QualityMode } from "@/lib/atlas-store";
import { LIGHTING_PRESETS } from "@/lib/lighting-presets";
import { haptic } from "@/lib/haptics";

const LIGHTS = Object.keys(LIGHTING_PRESETS) as LightingPreset[];
const THEMES: Array<{ id: AtlasTheme; label: string }> = [
  { id: "dark", label: "Night" },
  { id: "light", label: "Gallery" },
];
const QUALITY: Array<{ id: QualityMode; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "balanced", label: "Battery" },
  { id: "high", label: "Max" },
];

function Segment<T extends string>({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: T;
  items: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-[10px] tracking-[0.18em] text-[var(--atlas-muted)] uppercase">
        {label}
      </legend>
      <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-xl bg-black/15 p-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={value === item.id}
            onClick={() => {
              haptic(7);
              onChange(item.id);
            }}
            className={`min-h-9 rounded-lg px-2 text-[11px] transition-colors ${
              value === item.id
                ? "bg-[var(--atlas-accent)] text-[#17130d]"
                : "text-[var(--atlas-foreground)] hover:bg-white/8"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ExperienceControls() {
  const theme = useAtlas((s) => s.theme);
  const setTheme = useAtlas((s) => s.setTheme);
  const lightingPreset = useAtlas((s) => s.lightingPreset);
  const setLightingPreset = useAtlas((s) => s.setLightingPreset);
  const qualityMode = useAtlas((s) => s.qualityMode);
  const setQualityMode = useAtlas((s) => s.setQualityMode);
  const physiologyOn = useAtlas((s) => s.physiologyOn);
  const togglePhysiology = useAtlas((s) => s.togglePhysiology);
  const physiologyIntensity = useAtlas((s) => s.physiologyIntensity);
  const setPhysiologyIntensity = useAtlas((s) => s.setPhysiologyIntensity);
  const breathingOn = useAtlas((s) => s.breathingOn);
  const toggleBreathing = useAtlas((s) => s.toggleBreathing);

  return (
    <div className="grid w-full gap-3 rounded-2xl border border-white/8 bg-black/10 p-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-[var(--atlas-accent)] uppercase">
            Living model
          </p>
          <p className="mt-1 text-[11px] leading-4 text-[var(--atlas-muted)]">
            Touch flush, pressure response, and quiet resting motion.
          </p>
        </div>
        <button
          type="button"
          aria-pressed={physiologyOn}
          onClick={() => {
            haptic(8);
            togglePhysiology();
          }}
          className={`min-h-9 shrink-0 rounded-full px-3 text-[11px] ${
            physiologyOn
              ? "bg-[var(--atlas-accent)] text-[#17130d]"
              : "border border-white/15 text-[var(--atlas-foreground)]"
          }`}
        >
          {physiologyOn ? "On" : "Off"}
        </button>
      </div>

      <label className="grid gap-1 text-[10px] tracking-[0.18em] text-[var(--atlas-muted)] uppercase">
        Response intensity
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          disabled={!physiologyOn}
          value={physiologyIntensity}
          onChange={(event) => setPhysiologyIntensity(Number(event.target.value))}
          className="h-8 accent-[var(--atlas-accent)] disabled:opacity-35"
        />
      </label>

      <button
        type="button"
        aria-pressed={breathingOn}
        disabled={!physiologyOn}
        onClick={() => {
          haptic(7);
          toggleBreathing();
        }}
        className={`min-h-10 rounded-xl border text-[11px] ${
          breathingOn && physiologyOn
            ? "border-[var(--atlas-accent)]/45 bg-[var(--atlas-accent)]/10 text-[var(--atlas-accent)]"
            : "border-white/10 text-[var(--atlas-muted)]"
        } disabled:opacity-35`}
      >
        Resting breath {breathingOn ? "enabled" : "disabled"}
      </button>

      <Segment
        label="Studio light"
        value={lightingPreset}
        items={LIGHTS.map((id) => ({ id, label: LIGHTING_PRESETS[id].label }))}
        onChange={setLightingPreset}
      />
      <Segment label="Theme" value={theme} items={THEMES} onChange={setTheme} />
      <Segment label="Rendering" value={qualityMode} items={QUALITY} onChange={setQualityMode} />
    </div>
  );
}
