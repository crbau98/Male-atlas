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
    hemisphere: ["#f3ebe3", "#1a1612", 0.18],
    key: { color: "#fff6ea", intensity: 0.1, position: [2.2, 3.8, 3.1] },
    fill: { color: "#c3d0e4", intensity: 0.04, position: [-2.4, 1.8, 1.2] },
    rim: { color: "#f0c7a8", intensity: 0.02, position: [0.2, 1.8, -2.2] },
    environmentIntensity: 0.18,
    exposure: 1,
  },
  clinical: {
    label: "Clinical",
    description: "Neutral color and even illumination",
    background: { dark: "#111820", light: "#edf2f4" },
    ground: { dark: "#17212b", light: "#dde5e8" },
    hemisphere: ["#f7fbff", "#2a333c", 0.22],
    key: { color: "#f7fcff", intensity: 0.1, position: [1.8, 4.0, 3.0] },
    fill: { color: "#d8edff", intensity: 0.05, position: [-2.4, 2.2, 1.1] },
    rim: { color: "#b7d6ea", intensity: 0.02, position: [0, 2.3, -2.6] },
    environmentIntensity: 0.2,
    exposure: 1,
  },
  dramatic: {
    label: "Sculpture",
    description: "Deep contrast with a bronze rim",
    background: { dark: "#050507", light: "#e4d9c8" },
    ground: { dark: "#0d0c0f", light: "#d1c2ac" },
    hemisphere: ["#e7d5c1", "#08070a", 0.12],
    key: { color: "#ffe4c5", intensity: 0.16, position: [3.0, 3.4, 2.2] },
    fill: { color: "#8194bd", intensity: 0.04, position: [-2.5, 1.4, 0.5] },
    rim: { color: "#d6915d", intensity: 0.06, position: [-0.5, 2.2, -2.7] },
    environmentIntensity: 0.14,
    exposure: 1,
  },
};
