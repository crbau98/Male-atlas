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
  uInvertPeel?: IUniform<number>;
};

export function injectPeelShader(
  shader: Shader,
  uniforms: PeelUniforms & Record<string, IUniform>,
) {
  if (!uniforms.uInvertPeel) uniforms.uInvertPeel = { value: 0 };
  Object.assign(shader.uniforms, uniforms);
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
       uniform float uDissection;
       uniform vec3 uWindowCenter;
       uniform float uWindowRadius;
       uniform float uHasWindow;
       uniform float uInvertPeel;`,
    )
    .replace(
      "#include <clipping_planes_fragment>",
      `#include <clipping_planes_fragment>
       float windowAmt = 0.0;
       if (uHasWindow > 0.5) {
         float dWin = distance(vAtlasWorld, uWindowCenter);
         windowAmt = 1.0 - smoothstep(uWindowRadius * 0.42, uWindowRadius, dWin);
       }
       float peel = max(uDissection, windowAmt);
       float peelEdge = fwidth(peel) * 1.25;
       if (uInvertPeel > 0.5) {
         if (peel < 0.86 - peelEdge) discard;
       } else if (peel > 0.86 + peelEdge) discard;`,
    );
}
