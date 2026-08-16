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
  float n110 = atlasHash(i + vec3(1.0, 1.0, 0.0));
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
       uniform float uMotionAmount;`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
     float atlasChest = smoothstep(1.08, 1.18, position.y) * (1.0 - smoothstep(1.40, 1.48, position.y));
     float atlasAbdomen = smoothstep(0.90, 1.00, position.y) * (1.0 - smoothstep(1.16, 1.24, position.y));
     float atlasBreath = atlasChest + atlasAbdomen * 0.62;
     transformed += objectNormal * atlasBreath * sin(uBreathPhase) * uMotionAmount * 0.006;
     vec3 atlasTouchWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
     float atlasTouchPush = exp(-pow(distance(atlasTouchWorld, uTouchPoint) / 0.055, 2.0));
     transformed += objectNormal * atlasTouchPush * uTouchStrength * uPhysiology * 0.003;`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "uniform float uHasWindow;",
      `uniform float uHasWindow;
       ${SKIN_GLSL}`,
    )
    .replace(
      "if (uInvertPeel > 0.5) {",
      `if (uInvertPeel > 0.5) {`,
    )
    .replace(
      "} else if (peel > 0.86 + peelEdge) discard;",
      `} else if (peel > 0.86 + peelEdge) discard;
       float axPenis = abs(vAtlasWorld.x);
       float penisCover = (1.0 - atlasSoft(axPenis, 0.018, 0.042))
         * atlasSoft(vAtlasWorld.y, 0.778, 0.792)
         * (1.0 - atlasSoft(vAtlasWorld.y, 0.858, 0.882))
         * atlasSoft(vAtlasWorld.z, 0.155, 0.175);
       if (penisCover > 0.55) discard;`,
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 w = vAtlasWorld;
       float ax = abs(w.x);
       vec3 nrm = normalize(vAtlasNormal);
       float mottling = atlasFbm(w * 5.4) - 0.5;
       vec3 skin = uSkinTint;
       skin *= 0.985 + mottling * 0.028;
       skin = mix(skin, vec3(skin.r * 0.93, skin.g * 0.96, skin.b * 1.04), (1.0 - uMelanin) * 0.07);
       vec3 flush = mix(uSkinTint, uAttenuation, 0.55);
       float touchDistance = distance(w, uTouchPoint);
       float touchResponse = exp(-pow(touchDistance / 0.075, 2.0)) * uTouchStrength * uPhysiology;
       float goose = step(0.78, atlasHash(floor(w * 220.0))) * touchResponse;

       float faceMask = atlasSoft(w.y, 1.50, 1.54)
         * (1.0 - atlasSoft(w.y, 1.66, 1.70))
         * atlasSoft(w.z, 0.07, 0.11)
         * (1.0 - atlasSoft(ax, 0.075, 0.10));
       vec3 face = mix(skin, uSkinTint * vec3(1.05, 0.90, 0.88), 0.28);

       float lips = atlasSoft(w.y, 1.548, 1.556) * (1.0 - atlasSoft(w.y, 1.568, 1.576))
         * (1.0 - atlasSoft(ax, 0.016, 0.028))
         * atlasSoft(w.z, 0.175, 0.192);
       vec3 lipCol = mix(uSkinTint, vec3(0.62, 0.22, 0.24), 0.58 - uMelanin * 0.2);

       float nose = atlasSoft(w.y, 1.568, 1.578) * (1.0 - atlasSoft(w.y, 1.598, 1.610))
         * (1.0 - atlasSoft(ax, 0.012, 0.024))
         * atlasSoft(w.z, 0.175, 0.195);

       float earL = atlasSoft(-w.x, 0.066, 0.074) * atlasSoft(w.y, 1.58, 1.61) * (1.0 - atlasSoft(w.z, 0.07, 0.09));
       float earR = atlasSoft(w.x, 0.066, 0.074) * atlasSoft(w.y, 1.58, 1.61) * (1.0 - atlasSoft(w.z, 0.07, 0.09));
       float ears = max(earL, earR);
       vec3 earCol = mix(uSkinTint, vec3(0.72, 0.32, 0.30), 0.32);

       float eyeL = length(w - vec3(-0.031, 1.595, 0.164));
       float eyeR = length(w - vec3( 0.030, 1.595, 0.164));
       float eyeMin = min(eyeL, eyeR);
       float eye = 1.0 - atlasSoft(eyeMin, 0.012, 0.019);
       float iris = 1.0 - atlasSoft(eyeMin, 0.005, 0.010);
       float pupil = 1.0 - atlasSoft(eyeMin, 0.0017, 0.0034);
       float limbus = clamp(iris * (1.0 - iris) * 4.0, 0.0, 1.0);
       float catchL = 1.0 - atlasSoft(length(w - vec3(-0.028, 1.598, 0.172)), 0.0012, 0.0028);
       float catchR = 1.0 - atlasSoft(length(w - vec3( 0.033, 1.598, 0.172)), 0.0012, 0.0028);
       float scleraVein = eye * (1.0 - iris) * 0.12 * abs(sin(w.x * 90.0 + w.y * 40.0));
       float brow = atlasSoft(w.y, 1.612, 1.620) * (1.0 - atlasSoft(w.y, 1.628, 1.636))
         * atlasSoft(ax, 0.016, 0.026) * (1.0 - atlasSoft(ax, 0.048, 0.058))
         * atlasSoft(w.z, 0.10, 0.14);
       float stubble = atlasSoft(w.y, 1.515, 1.535) * (1.0 - atlasSoft(w.y, 1.555, 1.568))
         * (1.0 - atlasSoft(ax, 0.05, 0.072))
         * atlasSoft(w.z, 0.10, 0.16)
         * (0.28 + 0.72 * uMelanin);

       float scalp = atlasSoft(w.y, 1.57, 1.62)
         * (1.0 - atlasSoft(length(vec2(w.x, w.z - 0.075)), 0.092, 0.128));
       float hairCap = atlasSoft(w.y, 1.60, 1.64)
         * (1.0 - atlasSoft(length(vec2(w.x * 1.05, w.z - 0.06)), 0.078, 0.112));
       float strand = 0.55 + 0.45 * smoothstep(0.25, 0.9, abs(sin(w.x * 68.0 + w.z * 16.0 + w.y * 7.0)));
       float strand2 = 0.5 + 0.5 * smoothstep(0.2, 0.85, abs(sin(w.x * 140.0 - w.z * 38.0 + w.y * 22.0)));
       float hairVol = clamp(scalp * 0.82 + hairCap * 0.55, 0.0, 1.0);
       vec3 hairRoot = uHairColor * 0.72;

       float nippleL = 1.0 - atlasSoft(length(w - vec3(-0.068, 1.271, 0.225)), 0.011, 0.020);
       float nippleR = 1.0 - atlasSoft(length(w - vec3( 0.069, 1.271, 0.224)), 0.011, 0.020);
       float areola = max(nippleL, nippleR);
       vec3 areolaCol = mix(uSkinTint, vec3(0.45, 0.22, 0.18), 0.55 + uMelanin * 0.2);
       float navel = 1.0 - atlasSoft(length(w - vec3(0.0, 1.067, 0.206)), 0.007, 0.015);
       float palm = atlasSoft(w.y, 0.74, 0.88) * atlasSoft(ax, 0.22, 0.27) * (1.0 - atlasSoft(ax, 0.33, 0.34));
       vec3 palmCol = mix(uSkinTint, uSkinTint * vec3(1.06, 0.88, 0.82), 0.45);

       float scrotum = (1.0 - atlasSoft(ax, 0.034, 0.055))
         * atlasSoft(w.y, 0.748, 0.762)
         * (1.0 - atlasSoft(w.y, 0.788, 0.808))
         * atlasSoft(w.z, 0.125, 0.145)
         * (1.0 - atlasSoft(w.z, 0.185, 0.205));
       vec3 scrotumCol = mix(uSkinTint, vec3(0.38, 0.24, 0.18), 0.22 + uMelanin * 0.16);
       float raphe = (1.0 - atlasSoft(ax, 0.0012, 0.0048)) * scrotum;
       float pubic = atlasSoft(w.y, 0.82, 0.86) * (1.0 - atlasSoft(w.y, 0.92, 0.98))
         * (1.0 - atlasSoft(ax, 0.05, 0.11))
         * atlasSoft(w.z, 0.08, 0.13);

       vec3 col = mix(skin, face, clamp(faceMask, 0.0, 1.0));
       col = mix(col, earCol, clamp(ears, 0.0, 1.0));
       col = mix(col, lipCol, clamp(lips, 0.0, 1.0));
       col = mix(col, mix(uSkinTint, vec3(0.86, 0.62, 0.55), 0.22), clamp(nose * 0.4, 0.0, 1.0));
       col = mix(col, vec3(0.93, 0.94, 0.95), clamp(eye * 0.94, 0.0, 1.0));
       col = mix(col, vec3(0.78, 0.42, 0.40), scleraVein);
       col = mix(col, uEyeColor, clamp(iris, 0.0, 1.0));
       col = mix(col, uEyeColor * 0.35, limbus * 0.85);
       col = mix(col, vec3(0.06, 0.04, 0.04), clamp(pupil, 0.0, 1.0));
       col = mix(col, vec3(1.0), clamp(max(catchL, catchR), 0.0, 1.0));
       col = mix(col, uHairColor, clamp(brow * 0.94, 0.0, 1.0));
       col = mix(col, uHairColor, stubble * 0.48 * strand);
       col = mix(col, areolaCol, clamp(areola, 0.0, 1.0));
       col = mix(col, uSkinTint * 0.72, navel * 0.85);
       col = mix(col, palmCol, clamp(palm * 0.55, 0.0, 1.0));
       col = mix(col, scrotumCol, scrotum * 0.88);
       col = mix(col, scrotumCol * 0.72, raphe);
       col = mix(col, mix(hairRoot, uHairColor, strand2), hairVol * (0.88 + 0.12 * strand));
       col = mix(col, uHairColor, pubic * (0.5 + 0.4 * strand));
       float fuzz = faceMask * (1.0 - uMelanin) * strand * 0.1;
       col = mix(col, uHairColor, fuzz);
       float tzone = faceMask * atlasSoft(w.z, 0.16, 0.195) * (1.0 - atlasSoft(ax, 0.018, 0.04));
       float chestVein = (1.0 - uMelanin) * atlasSoft(w.y, 1.18, 1.24) * (1.0 - atlasSoft(w.y, 1.34, 1.4))
         * atlasSoft(w.z, 0.14, 0.2) * (0.35 + 0.65 * abs(sin(w.x * 36.0 + w.y * 18.0)));
       col = mix(col, mix(col, vec3(0.42, 0.28, 0.38), 0.35), chestVein * 0.22);
       col = mix(col, mix(col, uAttenuation, 0.58), touchResponse * 0.46);
       col *= 1.0 + goose * 0.035;

       float pore = 0.0;
       if (uClose > 0.45) {
         pore = (atlasFbm(w * 26.0) - 0.5) * 0.016 * uClose;
       }
       col *= 1.0 + pore;
       float ndv = abs(dot(nrm, normalize(cameraPosition - w)));
       float wrap = 0.78 + 0.22 * clamp(dot(nrm, vec3(0.22, 0.9, 0.35)), 0.0, 1.0);
       float sss = pow(1.0 - ndv, 1.7);
       float thin = clamp(ears * 1.35 + lips * 0.55 + nose * 0.28 + scrotum * 0.45 + areola * 0.25, 0.0, 1.0);
       col *= wrap;
       col = mix(col, flush, thin * 0.42 + sss * (0.1 + 0.12 * (1.0 - uMelanin)));
       col = mix(col, uSheenColor, 0.035 + uClose * 0.045 + tzone * 0.08 + lips * 0.06);
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
         roughnessFactor + atlasPoreRough * 0.05 + atlasSkinRough * 0.035 - atlasTouchRough * 0.08,
         0.05,
         0.95
       );`,
    );
}
