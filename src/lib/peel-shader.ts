import type { IUniform } from "three";

type Shader = {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, IUniform>;
};

export type PeelUniforms = {
  uDissection: IUniform<number>;
  uWindowCenter: IUniform<{ set: (...args: number[]) => void }>;
  uWindowRadius: IUniform<number>;
  uHasWindow: IUniform<number>;
};

export function injectPeelShader(
  shader: Shader,
  uniforms: PeelUniforms & Record<string, IUniform>,
) {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>\nvarying vec3 vAtlasWorld;`,
    )
    .replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>
       vAtlasWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
       varying vec3 vAtlasWorld;
       uniform float uDissection;
       uniform vec3 uWindowCenter;
       uniform float uWindowRadius;
       uniform float uHasWindow;`,
    )
    .replace(
      "#include <clipping_planes_fragment>",
      `#include <clipping_planes_fragment>
       float windowAmt = 0.0;
       if (uHasWindow > 0.5) {
         windowAmt = 1.0 - smoothstep(uWindowRadius * 0.45, uWindowRadius, distance(vAtlasWorld, uWindowCenter));
       }
       float peel = max(uDissection, windowAmt);
       if (peel > 0.88) discard;`,
    );
}
