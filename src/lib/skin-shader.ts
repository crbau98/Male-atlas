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
      "if (peel > 0.86 + peelEdge) discard;",
      `if (peel > 0.86 + peelEdge) discard;
       float axPenis = abs(vAtlasWorld.x);
       float penisCover = (1.0 - atlasSoft(axPenis, 0.020, 0.044))
         * atlasSoft(vAtlasWorld.y, 0.776, 0.788)
         * (1.0 - atlasSoft(vAtlasWorld.y, 0.848, 0.875))
         * atlasSoft(vAtlasWorld.z, 0.150, 0.168);
       if (penisCover > 0.58) discard;`,
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 w = vAtlasWorld;
       float ax = abs(w.x);
       vec3 nrm = normalize(vAtlasNormal);
       float mottling = atlasFbm(w * 7.5) - 0.5;
       vec3 skin = uSkinTint;
       skin *= 0.97 + mottling * 0.05;
       float cool = (1.0 - uMelanin) * 0.08;
       skin = mix(skin, vec3(skin.r * 0.92, skin.g * 0.95, skin.b * 1.04), cool);

       float faceMask = atlasSoft(w.y, 1.485, 1.545)
         * (1.0 - atlasSoft(length(w.xz), 0.095, 0.13))
         * atlasSoft(w.z, 0.02, 0.055);
       vec3 face = mix(skin, uSkinTint * vec3(1.04, 0.92, 0.90), 0.22);
       float lips = atlasSoft(w.y, 1.528, 1.538) * (1.0 - atlasSoft(w.y, 1.548, 1.558))
         * (1.0 - atlasSoft(ax, 0.018, 0.032))
         * atlasSoft(w.z, 0.088, 0.108);
       vec3 lipCol = mix(uSkinTint, vec3(0.62, 0.22, 0.24), 0.55 - uMelanin * 0.18);
       float nose = atlasSoft(w.y, 1.548, 1.562) * (1.0 - atlasSoft(w.y, 1.585, 1.600))
         * (1.0 - atlasSoft(ax, 0.012, 0.028))
         * atlasSoft(w.z, 0.095, 0.125);
       float earL = atlasSoft(w.x, 0.068, 0.086) * atlasSoft(w.y, 1.545, 1.575) * (1.0 - atlasSoft(w.z, 0.04, 0.07));
       float earR = atlasSoft(-w.x, 0.068, 0.086) * atlasSoft(w.y, 1.545, 1.575) * (1.0 - atlasSoft(w.z, 0.04, 0.07));
       float ears = max(earL, earR);
       vec3 earCol = mix(uSkinTint, vec3(0.72, 0.32, 0.30), 0.28);
       float eyeL = length(w - vec3(-0.032, 1.585, 0.095));
       float eyeR = length(w - vec3( 0.032, 1.585, 0.095));
       float eye = (1.0 - atlasSoft(min(eyeL, eyeR), 0.011, 0.018)) * faceMask;
       float iris = (1.0 - atlasSoft(min(eyeL, eyeR), 0.004, 0.009)) * eye;
       float brow = atlasSoft(w.y, 1.598, 1.608) * (1.0 - atlasSoft(w.y, 1.614, 1.622))
         * atlasSoft(ax, 0.018, 0.028) * (1.0 - atlasSoft(ax, 0.048, 0.058))
         * atlasSoft(w.z, 0.07, 0.10);
       float stubble = atlasSoft(w.y, 1.500, 1.525) * (1.0 - atlasSoft(w.y, 1.545, 1.560))
         * (1.0 - atlasSoft(ax, 0.055, 0.08))
         * atlasSoft(w.z, 0.04, 0.09)
         * (0.35 + 0.65 * uMelanin);

       float scalp = atlasSoft(w.y, 1.545, 1.605) * (1.0 - atlasSoft(length(w.xz), 0.078, 0.118));
       float strand = 0.55 + 0.45 * smoothstep(0.25, 0.9, abs(sin(w.x * 70.0 + w.z * 18.0 + w.y * 8.0)));

       float nippleL = 1.0 - atlasSoft(length(w - vec3(-0.095, 1.255, 0.125)), 0.012, 0.022);
       float nippleR = 1.0 - atlasSoft(length(w - vec3( 0.095, 1.255, 0.125)), 0.012, 0.022);
       float areola = max(nippleL, nippleR);
       vec3 areolaCol = mix(uSkinTint, vec3(0.45, 0.22, 0.18), 0.55 + uMelanin * 0.2);
       float navel = 1.0 - atlasSoft(length(w - vec3(0.0, 1.035, 0.125)), 0.008, 0.016);
       float palm = atlasSoft(w.y, 0.72, 0.82) * atlasSoft(ax, 0.20, 0.26) * (1.0 - atlasSoft(ax, 0.33, 0.34));
       vec3 palmCol = mix(uSkinTint, uSkinTint * vec3(1.06, 0.88, 0.82), 0.45);

       float scrotum = (1.0 - atlasSoft(ax, 0.036, 0.058))
         * atlasSoft(w.y, 0.750, 0.766)
         * (1.0 - atlasSoft(w.y, 0.792, 0.810))
         * atlasSoft(w.z, 0.122, 0.142)
         * (1.0 - atlasSoft(w.z, 0.172, 0.190));
       vec3 scrotumCol = mix(uSkinTint, vec3(0.38, 0.24, 0.18), 0.22 + uMelanin * 0.16);
       float raphe = (1.0 - atlasSoft(ax, 0.0012, 0.0048)) * scrotum;
       float pubic = atlasSoft(w.y, 0.82, 0.86) * (1.0 - atlasSoft(w.y, 0.92, 0.98))
         * (1.0 - atlasSoft(ax, 0.05, 0.11))
         * atlasSoft(w.z, 0.07, 0.12);

       vec3 col = mix(skin, face, faceMask);
       col = mix(col, earCol, clamp(ears, 0.0, 1.0));
       col = mix(col, lipCol, clamp(lips, 0.0, 1.0));
       col = mix(col, mix(uSkinTint, vec3(0.86, 0.62, 0.55), 0.2), nose * 0.35);
       col = mix(col, vec3(0.95, 0.95, 0.96), clamp(eye * 0.9, 0.0, 1.0));
       col = mix(col, uEyeColor, clamp(iris, 0.0, 1.0));
       col = mix(col, uHairColor, clamp(brow * 0.92, 0.0, 1.0));
       col = mix(col, uHairColor, stubble * 0.45 * strand);
       col = mix(col, areolaCol, clamp(areola, 0.0, 1.0));
       col = mix(col, uSkinTint * 0.72, navel * 0.8);
       col = mix(col, palmCol, clamp(palm * 0.55, 0.0, 1.0));
       col = mix(col, scrotumCol, scrotum * 0.88);
       col = mix(col, scrotumCol * 0.72, raphe);
       col = mix(col, uHairColor, scalp * (0.78 + 0.22 * strand));
       col = mix(col, uHairColor, pubic * (0.5 + 0.4 * strand));

       float pore = 0.0;
       if (uClose > 0.2) {
         pore = (atlasVnoise(w * 48.0) - 0.5) * 0.035 * uClose * uClose;
       }
       col *= 1.0 + pore;
       float wrap = 0.78 + 0.22 * clamp(dot(nrm, vec3(0.22, 0.9, 0.35)), 0.0, 1.0);
       col *= wrap;
       col = mix(col, uSheenColor, 0.04 + uClose * 0.05);
       diffuseColor.rgb = col;`,
    );
}
