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
uniform float uSmile;
uniform float uLid;
uniform float uJaw;
uniform float uBrow;
uniform sampler2D uFaceMap;
uniform sampler2D uFrontMap;
uniform sampler2D uBackMap;

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
       uniform float uArousal;
       uniform float uSmile;
       uniform float uLid;
       uniform float uJaw;
       uniform float uBrow;`,
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
     transformed += objectNormal * atlasPelvis * uArousal * uPhysiology * 0.004;
     float faceBand = smoothstep(1.485, 1.52, position.y);
     float mouthBand = faceBand * (1.0 - smoothstep(1.555, 1.585, position.y)) * smoothstep(0.05, 0.10, position.z);
     float corner = mouthBand * smoothstep(0.016, 0.036, abs(position.x));
     transformed.y += corner * uSmile * 0.0075;
     transformed.z -= corner * uSmile * 0.003;
     float brow = smoothstep(1.605, 1.62, position.y) * (1.0 - smoothstep(1.645, 1.66, position.y)) * smoothstep(0.04, 0.09, position.z);
     transformed.y += brow * uBrow * 0.0038;
     float lid = smoothstep(1.588, 1.60, position.y) * (1.0 - smoothstep(1.618, 1.632, position.y))
       * (1.0 - smoothstep(0.055, 0.07, abs(position.x))) * smoothstep(0.05, 0.09, position.z);
     transformed.y -= lid * uLid * 0.0058;
     float jaw = smoothstep(1.49, 1.51, position.y) * (1.0 - smoothstep(1.545, 1.56, position.y))
       * smoothstep(0.04, 0.09, position.z) * (1.0 - smoothstep(0.05, 0.08, abs(position.x)));
     transformed.y -= jaw * uJaw * 0.006;
     float nipple = (
       exp(-pow(distance(position.xy, vec2(0.092, 1.272)) / 0.012, 2.0)) +
       exp(-pow(distance(position.xy, vec2(-0.092, 1.272)) / 0.012, 2.0))
     ) * smoothstep(0.06, 0.09, position.z);
     transformed += objectNormal * nipple * uArousal * uPhysiology * 0.0036;`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "uniform float uHasWindow;",
      `uniform float uHasWindow;
       ${SKIN_GLSL}`,
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 w = vAtlasWorld;
       float ax = abs(w.x);
       vec3 nrm = normalize(vAtlasNormal);
       vec3 baked = diffuseColor.rgb;
       float bakedLuma = dot(baked, vec3(0.299, 0.587, 0.114));
       float bakedSat = max(max(baked.r, baked.g), baked.b) - min(min(baked.r, baked.g), baked.b);
       float bakeOk = step(0.08, bakedLuma) * (1.0 - step(0.82, bakedLuma)) * step(0.05, bakedSat);
       vec3 limb = uSkinTint * (0.9 + atlasFbm(w * 24.0) * 0.16);
       vec3 skin = mix(limb, baked, bakeOk);
       vec2 photoUV = vec2(
         clamp(0.515 + w.x * 0.95, 0.0, 1.0),
         clamp(-0.343 + 0.734 * w.y, 0.0, 1.0)
       );
       vec3 frontC = texture2D(uFrontMap, photoUV).rgb;
       vec3 backC = texture2D(uBackMap, vec2(1.0 - photoUV.x, photoUV.y)).rgb;
       float frontLuma = dot(frontC, vec3(0.299, 0.587, 0.114));
       float backLuma = dot(backC, vec3(0.299, 0.587, 0.114));
       float frontSat = max(max(frontC.r, frontC.g), frontC.b) - min(min(frontC.r, frontC.g), frontC.b);
       float backSat = max(max(backC.r, backC.g), backC.b) - min(min(backC.r, backC.g), backC.b);
       float frontLive = step(0.04, frontLuma) * step(0.045, frontSat) * (1.0 - step(0.84, frontLuma));
       float backLive = step(0.04, backLuma) * step(0.045, backSat) * (1.0 - step(0.84, backLuma));
       frontLive *= 1.0 - step(frontLuma, 0.36) * step(frontC.r + 0.03, frontC.b);
       backLive *= 1.0 - step(backLuma, 0.36) * step(backC.r + 0.03, backC.b);
       float wrap = smoothstep(-0.22, 0.18, nrm.z);
       float frontAmt = wrap * frontLive;
       float backAmt = (1.0 - wrap) * backLive;
       skin = mix(skin, backC, backAmt);
       skin = mix(skin, frontC, frontAmt);
       vec2 faceUV = vec2(0.5 - w.x * 5.15, clamp((w.y - 1.392) / 0.338, 0.0, 1.0));
       float faceMask = atlasSoft(w.y, 1.468, 1.498)
         * (1.0 - atlasSoft(w.y, 1.718, 1.742))
         * atlasSoft(w.z, 0.018, 0.05)
         * (1.0 - atlasSoft(ax, 0.088, 0.118));
       vec3 facePhoto = texture2D(uFaceMap, faceUV).rgb;
       float faceLuma = dot(facePhoto, vec3(0.299, 0.587, 0.114));
       float faceSat = max(max(facePhoto.r, facePhoto.g), facePhoto.b) - min(min(facePhoto.r, facePhoto.g), facePhoto.b);
       float faceLive = step(0.05, faceLuma) * step(0.04, faceSat) * (1.0 - step(0.9, faceLuma));
       skin = mix(skin, facePhoto, faceMask * faceLive);
       vec3 photoTint = vec3(0.82, 0.64, 0.54);
       float tintMix = clamp(abs(uMelanin - 0.16) * 1.15, 0.0, 0.7);
       skin = mix(skin, skin * (uSkinTint / max(photoTint, vec3(0.08))), tintMix);
       vec3 flush = mix(skin, uAttenuation, 0.42);
       float touchDistance = distance(w, uTouchPoint);
       float touchResponse = exp(-pow(touchDistance / 0.09, 2.0)) * uTouchStrength * uPhysiology;
       float goose = step(0.78, atlasHash(floor(w * 220.0))) * touchResponse;
       float pubic = atlasSoft(w.y, 0.82, 0.86) * (1.0 - atlasSoft(w.y, 0.93, 0.98))
         * (1.0 - atlasSoft(ax, 0.038, 0.10))
         * atlasSoft(w.z, 0.02, 0.09);
       float strand = 0.55 + 0.45 * smoothstep(0.25, 0.9, abs(sin(w.x * 68.0 + w.z * 16.0 + w.y * 7.0)));
       vec3 col = skin;
       col = mix(col, uHairColor, pubic * (0.28 + 0.34 * strand) * (0.35 + 0.65 * uMelanin));
       col = mix(col, mix(col, uAttenuation, 0.55), touchResponse * 0.4);
       float cheek = atlasSoft(w.y, 1.52, 1.545) * (1.0 - atlasSoft(w.y, 1.60, 1.62))
         * atlasSoft(ax, 0.018, 0.028) * (1.0 - atlasSoft(ax, 0.062, 0.078))
         * atlasSoft(w.z, 0.04, 0.10);
       float chestFlush = atlasSoft(w.y, 1.16, 1.22) * (1.0 - atlasSoft(w.y, 1.38, 1.44))
         * atlasSoft(w.z, 0.02, 0.08) * (1.0 - atlasSoft(ax, 0.16, 0.22));
       float pelvicFlush = atlasSoft(w.y, 0.78, 0.84) * (1.0 - atlasSoft(w.y, 0.96, 1.02))
         * atlasSoft(w.z, 0.0, 0.05) * (1.0 - atlasSoft(ax, 0.12, 0.18));
       col = mix(col, mix(col, uAttenuation, 0.45), cheek * uAffect * 0.55);
       col = mix(col, mix(col, uAttenuation, 0.4), chestFlush * (uAffect * 0.28 + uArousal * 0.16));
       col = mix(col, mix(col, vec3(0.55, 0.22, 0.26), 0.35), pelvicFlush * uArousal * 0.32);
       col *= 1.0 + goose * 0.02;
       float ndv = abs(dot(nrm, normalize(cameraPosition - w)));
       float sss = pow(1.0 - ndv, 1.7);
       col = mix(col, flush, sss * (0.03 + 0.04 * (1.0 - uMelanin) + uAffect * 0.04));
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
         roughnessFactor + atlasPoreRough * 0.06 + atlasSkinRough * 0.04 - atlasTouchRough * 0.08
           - uAffect * 0.035 - uArousal * 0.04,
         0.08,
         0.95
       );`,
    )
    .replace(
      "#include <tonemapping_fragment>",
      `#include <tonemapping_fragment>
       gl_FragColor.rgb = mix(gl_FragColor.rgb, diffuseColor.rgb, 0.9);`,
    );
}

export function injectEyeShader(
  shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, IUniform> },
  extra: Record<string, IUniform>,
) {
  Object.assign(shader.uniforms, extra);
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
       varying vec3 vEyeObjN;
       uniform float uPupil;`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       vEyeObjN = objectNormal;`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
       varying vec3 vEyeObjN;
       uniform float uPupil;
       uniform vec3 uIris;`,
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 n = normalize(vEyeObjN);
       float r = length(n.xy) / max(n.z, 0.08);
       vec3 sclera = vec3(0.93, 0.92, 0.90);
       vec3 iris = mix(uIris, uIris * 0.32, smoothstep(0.12, 0.48, r));
       float pupilR = 0.16 + uPupil * 0.28;
       vec3 col = sclera;
       col = mix(col, iris, 1.0 - smoothstep(0.38, 0.52, r));
       col = mix(col, vec3(0.03, 0.02, 0.02), 1.0 - smoothstep(pupilR, pupilR + 0.045, r));
       float limbus = smoothstep(0.34, 0.4, r) * (1.0 - smoothstep(0.5, 0.56, r));
       col *= 1.0 - limbus * 0.35;
       diffuseColor.rgb = col;`,
    );
}
