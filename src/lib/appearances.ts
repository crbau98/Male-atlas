import type { AppearanceId } from "./types";

export type Appearance = {
  id: AppearanceId;
  name: string;
  origin: string;
  blurb: string;
  portrait: string;
  albedo: string;
  normal: string;
  roughness: string;
  melanin: number;
  skinTint: string;
  attenuation: string;
  hair: string;
  eyes: string;
  sheen: string;
};

export const APPEARANCES: Appearance[] = [
  {
    id: "julian",
    name: "Julian",
    origin: "Northern European look",
    blurb: "Fair cool-pink undertone, ash-brown hair, grey-green iris.",
    portrait: "/appearances/male-atlas-julian.png",
    albedo: "/skins/skin-albedo-fair.png",
    normal: "/skins/skin-normal.png",
    roughness: "/skins/skin-rough-fair.png",
    melanin: 0.16,
    skinTint: "#f3c7b0",
    attenuation: "#c45a48",
    hair: "#2c2118",
    eyes: "#6a7d62",
    sheen: "#f6d7c8",
  },
  {
    id: "malik",
    name: "Malik",
    origin: "West African look",
    blurb: "Deep melanin, cool highlights, black hair, dark amber iris.",
    portrait: "/appearances/male-atlas-malik.png",
    albedo: "/skins/skin-albedo-deep.png",
    normal: "/skins/skin-normal.png",
    roughness: "/skins/skin-rough-deep.png",
    melanin: 0.78,
    skinTint: "#6a3a28",
    attenuation: "#2a120c",
    hair: "#0a0908",
    eyes: "#3d2a18",
    sheen: "#8a5a40",
  },
  {
    id: "kenji",
    name: "Kenji",
    origin: "East Asian look",
    blurb: "Warm ivory undertone, dense black hair, dark brown iris.",
    portrait: "/appearances/male-atlas-kenji.png",
    albedo: "/skins/skin-albedo-warm.png",
    normal: "/skins/skin-normal.png",
    roughness: "/skins/skin-rough-warm.png",
    melanin: 0.28,
    skinTint: "#e8c3a8",
    attenuation: "#b85a42",
    hair: "#111111",
    eyes: "#2a1c12",
    sheen: "#f0d4be",
  },
  {
    id: "diego",
    name: "Diego",
    origin: "Mediterranean look",
    blurb: "Olive-gold undertone, dark wavy hair, hazel iris.",
    portrait: "/appearances/male-atlas-diego.png",
    albedo: "/skins/skin-albedo-olive.png",
    normal: "/skins/skin-normal.png",
    roughness: "/skins/skin-rough-olive.png",
    melanin: 0.42,
    skinTint: "#c99270",
    attenuation: "#8a3e2c",
    hair: "#1a120c",
    eyes: "#5a4220",
    sheen: "#e0b894",
  },
];

export function appearanceById(id: AppearanceId): Appearance {
  return APPEARANCES.find((a) => a.id === id) ?? APPEARANCES[0];
}
