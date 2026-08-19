import type { IUniform } from "three";

export function injectGenitalSkin(
  shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, IUniform> },
  extra: Record<string, IUniform>,
) {
  Object.assign(shader.uniforms, extra);

  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
       uniform float uArousal;
       uniform float uPhysiology;
       varying vec3 vGenitalObj;
       varying vec3 vGenitalWorld;`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       vGenitalObj = position;
       float dartos = uArousal * uPhysiology;
       // Micro-pulsations and dartos contractility
       transformed += objectNormal * sin(position.x * 120.0 + position.y * 80.0) * dartos * 0.0012;
       vGenitalWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
    );

  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
       uniform float uArousal;
       uniform float uPhysiology;
       uniform float uPart; // 0: shaft, 1: glans, 2: scrotum
       varying vec3 vGenitalObj;
       varying vec3 vGenitalWorld;`,
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       float a = uArousal * uPhysiology;
       vec3 col = diffuseColor.rgb;

       // Physiological vascular and mucosal tones
       vec3 deepArterial = vec3(0.72, 0.20, 0.24);
       vec3 scrotalDusk = vec3(0.46, 0.14, 0.18);
       vec3 glansEngorged = vec3(0.82, 0.26, 0.32);

       if (uPart > 1.5) {
         // Scrotum: Dartos reflex, increased vascular saturation and dusky tone
         col = mix(col, scrotalDusk, a * 0.58);
         col *= 1.0 - a * 0.08;
       } else if (uPart > 0.5) {
         // Glans: Prominent arterial hyperemia, coronal tumescence flush, mucosal redness
         col = mix(col, glansEngorged, 0.24 + a * 0.68);
         // Corona glandis heightened flush
         if (vGenitalObj.y < 0.022 && vGenitalObj.y > 0.005) {
           col = mix(col, vec3(0.88, 0.24, 0.30), a * 0.35);
         }
       } else {
         // Shaft: Corpora cavernosa blood engorgement & dorsal vein dilation
         col = mix(col, deepArterial, 0.10 + a * 0.52);
         // Dorsal vein prominent blue-violet arterial flush along midline
         if (vGenitalObj.z > 0.004) {
           float veinMask = exp(-pow(vGenitalObj.x / 0.0035, 2.0));
           vec3 veinColor = vec3(0.42, 0.22, 0.38);
           col = mix(col, veinColor, veinMask * a * 0.38);
         }
       }

       diffuseColor.rgb = col;`,
    )
    .replace(
      "#include <roughnessmap_fragment>",
      `#include <roughnessmap_fragment>
       float aR = uArousal * uPhysiology;
       if (uPart > 1.5) {
         // Scrotum: Dartos tightening creates taut rugae with slight moist sheen
         roughnessFactor = clamp(roughnessFactor - aR * 0.14, 0.22, 0.85);
       } else if (uPart > 0.5) {
         // Glans: High mucosal turgidity creates glossy, reflective, moist surface
         roughnessFactor = clamp(roughnessFactor - aR * 0.35, 0.04, 0.45);
       } else {
         // Shaft: Taut erectile skin with lubricated sheen
         roughnessFactor = clamp(roughnessFactor - aR * 0.26, 0.06, 0.65);
       }`,
    );
}
