import type { IUniform } from "three";

const SKIN_GLSL = /* glsl */ `
uniform vec3 uHairColor;
uniform vec3 uSkinTint;
uniform vec3 uEyeColor;
uniform vec3 uSheenColor;
uniform vec3 uAttenuation;
uniform vec3 uTouchPoint;
uniform float uMelanin;
uniform float uClose;
uniform float uTouchStrength;
uniform float uPhysiology;
uniform float uBreathPhase;
uniform float uMotionAmount;
uniform float uAffect;
uniform float uArousal;

float atlasHash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.23));
  p += dot(p, p.yzx + 19.19);
  return fract(p.x * p.y * p.z);
}
float atlasVnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = atlasHash(i);
  float n100 = atlasHash(i + vec3(1.0, 0.0, 0.0));
  float n010 = atlasHash(i + vec3(0.0, 1.0, 0.0));
  float n110 = atlasHash(i + vec3(1.0, 0.0, 1.0));
  float n001 = atlasHash(i + vec3(0.0, 0.0, 1.0));
  float n101 = atlasHash(i + vec3(1.0, 0.0, 1.0));
  float n011 = atlasHash(i + vec3(0.0, 1.0, 1.0));
  float n111 = atlasHash(i + vec3(1.0, 1.0, 1.0));
  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);
  return mix(mix(nx00, nx10, f.y), mix(nx01, nx11, f.y), f.z);
}
float atlasFbm(vec3 p) {
  return atlasVnoise(p) * 0.6 + atlasVnoise(p * 2.03) * 0.28 + atlasVnoise(p * 4.07) * 0.12;
}
float atlasSoft(float x, float a, float b) {
  return smoothstep(a, b, x);
}
`;

export function injectPhotorealSkin(
  shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, IUniform> },
  extra: Record<string, IUniform>,
) {
  Object.assign(shader.uniforms, extra);
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
       uniform vec3 uTouchPoint;
       uniform float uTouchStrength;
       uniform float uPhysiology;
       uniform float uBreathPhase;
       uniform float uMotionAmount;
       uniform float uAffect;
       uniform float uArousal;`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
     float atlasChest = smoothstep(1.08, 1.18, position.y) * (1.0 - smoothstep(1.40, 1.48, position.y));
     float atlasAbdomen = smoothstep(0.90, 1.00, position.y) * (1.0 - smoothstep(1.16, 1.24, position.y));
     float atlasBreath = atlasChest + atlasAbdomen * 0.62;
     transformed += objectNormal * atlasBreath * sin(uBreathPhase) * uMotionAmount * (0.0095 + uArousal * 0.007);
     vec3 atlasTouchWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
     float atlasTouchPush = exp(-pow(distance(atlasTouchWorld, uTouchPoint) / 0.055, 2.0));
     transformed += objectNormal * atlasTouchPush * uTouchStrength * uPhysiology * (0.004 + uAffect * 0.003);
     float atlasPelvis = smoothstep(0.76, 0.84, position.y) * (1.0 - smoothstep(0.92, 0.98, position.y));
     transformed += objectNormal * atlasPelvis * uArousal * uPhysiology * 0.007;`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "uniform float uHasWindow;",
      `uniform float uHasWindow;
       ${SKIN_GLSL}`,
    )
    .replace(
      "} else if (peel > 0.86 + peelEdge) discard;",
      `} else if (peel > 0.86 + peelEdge) discard;
       float groinHole = (1.0 - atlasSoft(abs(vAtlasWorld.x), 0.034, 0.068))
         * atlasSoft(vAtlasWorld.y, 0.792, 0.818)
         * (1.0 - atlasSoft(vAtlasWorld.y, 0.905, 0.938))
         * atlasSoft(vAtlasWorld.z, 0.018, 0.055);
       if (groinHole > 0.42) discard;`,
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 w = vAtlasWorld;
       float ax = abs(w.x);
       vec3 nrm = normalize(vAtlasNormal);
       vec3 baked = diffuseColor.rgb;
       float bakedLuma = dot(baked, vec3(0.299, 0.587, 0.114));
       vec3 photoTint = vec3(0.953, 0.780, 0.690);
       vec3 skin = bakedLuma < 0.035 ? uSkinTint : baked;
       float tintMix = clamp(abs(uMelanin - 0.16) * 1.4, 0.0, 0.85);
       skin = mix(skin, skin * (uSkinTint / max(photoTint, vec3(0.08))), tintMix);
       skin *= 0.99 + (atlasFbm(w * 6.2) - 0.5) * 0.028;
       vec3 flush = mix(skin, uAttenuation, 0.48);
       float touchDistance = distance(w, uTouchPoint);
       float touchResponse = exp(-pow(touchDistance / 0.09, 2.0)) * uTouchStrength * uPhysiology;
       float goose = step(0.78, atlasHash(floor(w * 220.0))) * touchResponse;
       float pubic = atlasSoft(w.y, 0.82, 0.86) * (1.0 - atlasSoft(w.y, 0.93, 0.98))
         * (1.0 - atlasSoft(ax, 0.038, 0.10))
         * atlasSoft(w.z, 0.02, 0.09);
       float strand = 0.55 + 0.45 * smoothstep(0.25, 0.9, abs(sin(w.x * 68.0 + w.z * 16.0 + w.y * 7.0)));
       vec3 col = skin;
       col = mix(col, uHairColor, pubic * (0.32 + 0.38 * strand) * (0.35 + 0.65 * uMelanin));
       col = mix(col, mix(col, uAttenuation, 0.68), touchResponse * 0.55);
       float cheek = atlasSoft(w.y, 1.52, 1.545) * (1.0 - atlasSoft(w.y, 1.60, 1.62))
         * atlasSoft(ax, 0.018, 0.028) * (1.0 - atlasSoft(ax, 0.062, 0.078))
         * atlasSoft(w.z, 0.04, 0.10);
       float lid = atlasSoft(w.y, 1.588, 1.598) * (1.0 - atlasSoft(w.y, 1.618, 1.628))
         * atlasSoft(ax, 0.012, 0.022) * (1.0 - atlasSoft(ax, 0.048, 0.058));
       float chestFlush = atlasSoft(w.y, 1.16, 1.22) * (1.0 - atlasSoft(w.y, 1.38, 1.44))
         * atlasSoft(w.z, 0.02, 0.08) * (1.0 - atlasSoft(ax, 0.16, 0.22));
       float pelvicFlush = atlasSoft(w.y, 0.78, 0.84) * (1.0 - atlasSoft(w.y, 0.96, 1.02))
         * atlasSoft(w.z, 0.0, 0.05) * (1.0 - atlasSoft(ax, 0.12, 0.18));
       col = mix(col, mix(col, uAttenuation, 0.55), cheek * uAffect * 0.7);
       col = mix(col, col * 0.72, lid * uAffect * 0.45);
       col = mix(col, mix(col, uAttenuation, 0.5), chestFlush * uAffect * 0.42);
       col = mix(col, mix(col, vec3(0.62, 0.22, 0.28), 0.4), pelvicFlush * uArousal * 0.55);
       col *= 1.0 + goose * 0.035;
       if (uClose > 0.45) {
         col *= 1.0 + (atlasFbm(w * 26.0) - 0.5) * 0.016 * uClose;
       }
       float ndv = abs(dot(nrm, normalize(cameraPosition - w)));
       float wrap = 0.84 + 0.16 * clamp(dot(nrm, vec3(0.22, 0.9, 0.35)), 0.0, 1.0);
       float sss = pow(1.0 - ndv, 1.8);
       col *= wrap;
       col = mix(col, flush, sss * (0.08 + 0.10 * (1.0 - uMelanin) + uAffect * 0.08));
       col = mix(col, uSheenColor, 0.025 + uClose * 0.04 + uArousal * 0.05);
       diffuseColor.rgb = col;`,
    )
    .replace(
      "#include <roughnessmap_fragment>",
      `#include <roughnessmap_fragment>
       float atlasPoreRough = atlasFbm(vAtlasWorld * 340.0) - 0.5;
       float atlasSkinRough = atlasFbm(vAtlasWorld * 18.0) - 0.5;
       float atlasTouchRough = exp(-pow(distance(vAtlasWorld, uTouchPoint) / 0.075, 2.0))
         * uTouchStrength * uPhysiology;
       roughnessFactor = clamp(
         roughnessFactor + atlasPoreRough * 0.05 + atlasSkinRough * 0.035 - atlasTouchRough * 0.08
           - uAffect * 0.04 - uArousal * 0.05,
         0.05,
         0.95
       );`,
    );
}
