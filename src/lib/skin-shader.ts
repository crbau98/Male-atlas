import type { IUniform } from "three";

const SKIN_GLSL = /* glsl */ `
uniform vec3 uHairColor;
uniform vec3 uSkinTint;
uniform vec3 uEyeColor;
uniform vec3 uSheenColor;
uniform float uMelanin;
uniform float uClose;

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
  shader: { fragmentShader: string; uniforms: Record<string, IUniform> },
  extra: Record<string, IUniform>,
) {
  Object.assign(shader.uniforms, extra);
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
       float mottling = atlasFbm(w * 6.2) - 0.5;
       vec3 skin = uSkinTint;
       skin *= 0.97 + mottling * 0.045;
       skin = mix(skin, vec3(skin.r * 0.93, skin.g * 0.96, skin.b * 1.03), (1.0 - uMelanin) * 0.08);

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
       float eye = 1.0 - atlasSoft(min(eyeL, eyeR), 0.012, 0.019);
       float iris = 1.0 - atlasSoft(min(eyeL, eyeR), 0.005, 0.010);
       float brow = atlasSoft(w.y, 1.612, 1.620) * (1.0 - atlasSoft(w.y, 1.628, 1.636))
         * atlasSoft(ax, 0.016, 0.026) * (1.0 - atlasSoft(ax, 0.048, 0.058))
         * atlasSoft(w.z, 0.10, 0.14);
       float stubble = atlasSoft(w.y, 1.515, 1.535) * (1.0 - atlasSoft(w.y, 1.555, 1.568))
         * (1.0 - atlasSoft(ax, 0.05, 0.072))
         * atlasSoft(w.z, 0.10, 0.16)
         * (0.28 + 0.72 * uMelanin);

       float scalp = atlasSoft(w.y, 1.58, 1.64)
         * (1.0 - atlasSoft(length(vec2(w.x, w.z - 0.075)), 0.088, 0.118));
       float strand = 0.55 + 0.45 * smoothstep(0.25, 0.9, abs(sin(w.x * 68.0 + w.z * 16.0 + w.y * 7.0)));

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
       col = mix(col, vec3(0.95, 0.95, 0.96), clamp(eye * 0.92, 0.0, 1.0));
       col = mix(col, uEyeColor, clamp(iris, 0.0, 1.0));
       col = mix(col, uHairColor, clamp(brow * 0.94, 0.0, 1.0));
       col = mix(col, uHairColor, stubble * 0.48 * strand);
       col = mix(col, areolaCol, clamp(areola, 0.0, 1.0));
       col = mix(col, uSkinTint * 0.72, navel * 0.85);
       col = mix(col, palmCol, clamp(palm * 0.55, 0.0, 1.0));
       col = mix(col, scrotumCol, scrotum * 0.88);
       col = mix(col, scrotumCol * 0.72, raphe);
       col = mix(col, uHairColor, scalp * (0.82 + 0.18 * strand));
       col = mix(col, uHairColor, pubic * (0.5 + 0.4 * strand));

       float pore = 0.0;
       if (uClose > 0.25) {
         pore = (atlasVnoise(w * 42.0) - 0.5) * 0.03 * uClose * uClose;
       }
       col *= 1.0 + pore;
       float wrap = 0.8 + 0.2 * clamp(dot(nrm, vec3(0.22, 0.9, 0.35)), 0.0, 1.0);
       col *= wrap;
       col = mix(col, uSheenColor, 0.04 + uClose * 0.05);
       diffuseColor.rgb = col;`,
    );
}
