import type { IUniform } from "three";

export function injectGenitalSkin(
  shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, IUniform> },
  extra: Record<string, IUniform>,
) {
  Object.assign(shader.uniforms, extra);
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `#include <common>
     uniform float uArousal;
     uniform float uPhysiology;
     varying vec3 vGenitalObj;`,
  ).replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
     vGenitalObj = position;
     float dartos = uArousal * uPhysiology;
     transformed += objectNormal * sin(position.x * 90.0 + position.y * 70.0) * dartos * 0.0014;`,
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    `#include <common>
     uniform float uArousal;
     uniform float uPhysiology;
     uniform float uPart;
     varying vec3 vGenitalObj;`,
  ).replace(
    "#include <color_fragment>",
    `#include <color_fragment>
     float a = uArousal * uPhysiology;
     vec3 col = diffuseColor.rgb;
     vec3 blood = vec3(0.52, 0.16, 0.18);
     vec3 dusk = vec3(0.38, 0.12, 0.16);
     if (uPart > 1.5) {
       col = mix(col, dusk, a * 0.55);
       col *= 1.0 - a * 0.08;
     } else if (uPart > 0.5) {
       col = mix(col, blood, 0.18 + a * 0.5);
     } else {
       col = mix(col, blood, a * 0.28);
     }
     diffuseColor.rgb = col;`,
  ).replace(
    "#include <roughnessmap_fragment>",
    `#include <roughnessmap_fragment>
     float a = uArousal * uPhysiology;
     if (uPart > 1.5) {
       roughnessFactor = clamp(roughnessFactor + 0.08 + a * 0.12, 0.12, 0.92);
     } else if (uPart > 0.5) {
       roughnessFactor = clamp(roughnessFactor - a * 0.22, 0.08, 0.7);
     } else {
       roughnessFactor = clamp(roughnessFactor - a * 0.12, 0.14, 0.8);
     }`,
  );
}
