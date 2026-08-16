import type { LightingPreset } from "./atlas-store";

export type StudioLighting = {
  label: string;
  description: string;
  background: { dark: string; light: string };
  ground: { dark: string; light: string };
  hemisphere: [sky: string, ground: string, intensity: number];
  key: { color: string; intensity: number; position: [number, number, number] };
  fill: { color: string; intensity: number; position: [number, number, number] };
  rim: { color: string; intensity: number; position: [number, number, number] };
  environmentIntensity: number;
  exposure: number;
};

export const LIGHTING_PRESETS: Record<LightingPreset, StudioLighting> = {
  museum: {
    label: "Museum",
    description: "Warm, sculptural gallery light",
    background: { dark: "#090a0e", light: "#eee7da" },
    ground: { dark: "#12141b", light: "#ded3c1" },
    hemisphere: ["#fff5e8", "#191511", 0.62],
    key: { color: "#fff1df", intensity: 1.45, position: [2.6, 4.4, 2.4] },
    fill: { color: "#9eb4d4", intensity: 0.46, position: [-2.8, 1.6, -1.8] },
    rim: { color: "#ffd1b4", intensity: 0.38, position: [0.2, 1.6, -2.5] },
    environmentIntensity: 1.02,
    exposure: 1.12,
  },
  clinical: {
    label: "Clinical",
    description: "Neutral color and even illumination",
    background: { dark: "#111820", light: "#edf2f4" },
    ground: { dark: "#17212b", light: "#dde5e8" },
    hemisphere: ["#f5fbff", "#27333d", 0.9],
    key: { color: "#f7fcff", intensity: 1.18, position: [1.8, 4.2, 2.8] },
    fill: { color: "#d8edff", intensity: 0.72, position: [-2.4, 2.2, 1.1] },
    rim: { color: "#b7d6ea", intensity: 0.32, position: [0, 2.3, -2.6] },
    environmentIntensity: 1.18,
    exposure: 1.04,
  },
  dramatic: {
    label: "Sculpture",
    description: "Deep contrast with a bronze rim",
    background: { dark: "#050507", light: "#e4d9c8" },
    ground: { dark: "#0d0c0f", light: "#d1c2ac" },
    hemisphere: ["#e7d5c1", "#08070a", 0.28],
    key: { color: "#ffe4c5", intensity: 1.72, position: [3.2, 3.7, 1.8] },
    fill: { color: "#8194bd", intensity: 0.2, position: [-2.5, 1.4, 0.5] },
    rim: { color: "#d6915d", intensity: 0.84, position: [-0.5, 2.2, -2.7] },
    environmentIntensity: 0.68,
    exposure: 1.08,
  },
};
