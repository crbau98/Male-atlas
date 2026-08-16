import type { IUniform } from "three";
import type { CatalogPart } from "./types";

export type PlateKind = "muscle" | "bone" | "artery" | "vein" | "nerve" | "viscera" | "gland" | "other";

const KIND_ID: Record<PlateKind, number> = {
  muscle: 0,
  bone: 1,
  artery: 2,
  vein: 3,
  nerve: 4,
  viscera: 5,
  gland: 6,
  other: 7,
};

export function plateKind(part: CatalogPart | undefined, system: string): PlateKind {
  const n = (part?.name ?? "").toLowerCase();
  if (system === "muscular" || /muscle|tendon|ligament/.test(n)) return "muscle";
  if (system === "skeletal" || /bone|cartilage|vertebra|rib|skull|femur|tibia/.test(n)) return "bone";
  if (system === "cardiovascular") {
    if (/vein|vena|caval|sinus of/.test(n)) return "vein";
    return "artery";
  }
  if (system === "nervous" || /nerve|brain|cortex|gyrus|cord/.test(n)) return "nerve";
  if (system === "endocrine" || system === "lymphatic" || /gland|thymus|spleen|thyroid/.test(n)) return "gland";
  if (
    system === "digestive" ||
    system === "respiratory" ||
    system === "urinary" ||
    system === "reproductive" ||
    system === "sensory"
  ) {
    return "viscera";
  }
  return "other";
}

export function plateColor(part: CatalogPart | undefined, system: string, fallback: string): string {
  const n = (part?.name ?? "").toLowerCase();
  const kind = plateKind(part, system);
  if (kind === "vein") return "#3d6ea8";
  if (kind === "artery") {
    if (/heart|ventricle|atrium|myocard/.test(n)) return "#b31b28";
    return "#d1242c";
  }
  if (kind === "bone") return "#f3ead4";
  if (kind === "muscle") return "#c45a52";
  if (kind === "nerve") {
    if (/brain|cortex|gyrus|cerebell|hemisphere/.test(n)) return "#e8b7c9";
    return "#f2e3a0";
  }
  if (kind === "gland") return "#7eb389";
  if (kind === "viscera") {
    if (/lung|bronchus|trachea/.test(n)) return "#e6b4b8";
    if (/liver|hepatic/.test(n)) return "#8a3d3a";
    if (/stomach|colon|ileum|jejunum|intestin/.test(n)) return "#d4a574";
    if (/kidney|renal/.test(n)) return "#c9898a";
    if (/bladder/.test(n)) return "#d9c56a";
    if (/prostate|testis|glans|cavernosum|spongiosum/.test(n)) return "#d4a0b4";
    return fallback;
  }
  return fallback;
}

type Shader = {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, IUniform>;
};

export function injectIllustrationShader(shader: Shader, kind: PlateKind) {
  shader.uniforms.uPlateKind = { value: KIND_ID[kind] };
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
       varying vec3 vAtlasWorld;
       varying vec3 vAtlasNormal;`,
    )
    .replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>
       vAtlasWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
       vAtlasNormal = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
       varying vec3 vAtlasWorld;
       varying vec3 vAtlasNormal;
       uniform float uPlateKind;`,
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 pn = normalize(vAtlasNormal);
       float wrap = 0.62 + 0.38 * clamp(dot(pn, vec3(0.28, 0.86, 0.38)), 0.0, 1.0);
       float rim = pow(1.0 - abs(dot(pn, normalize(cameraPosition - vAtlasWorld))), 2.4);
       if (uPlateKind < 0.5) {
         float fiber = 0.5 + 0.5 * sin(vAtlasWorld.y * 70.0 + vAtlasWorld.x * 12.0);
         diffuseColor.rgb *= mix(0.92, 1.05, fiber);
       }
       if (uPlateKind > 0.5 && uPlateKind < 1.5) {
         diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.96, 0.93, 0.86), 0.12);
       }
       diffuseColor.rgb *= wrap;
       diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.11, 0.08), rim * 0.58);
       diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.88, 0.78), 0.07);`,
    );
}
