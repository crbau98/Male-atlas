"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { appearanceById } from "@/lib/appearances";
import { useAtlas } from "@/lib/atlas-store";

type PeelUniforms = {
  uDissection: { value: number };
  uWindowCenter: { value: THREE.Vector3 };
  uWindowRadius: { value: number };
  uHairColor: { value: THREE.Color };
  uHasWindow: { value: number };
};

export function PhotorealShell() {
  const appearanceId = useAtlas((s) => s.appearanceId);
  const dissection = useAtlas((s) => s.dissection);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const peelRadius = useAtlas((s) => s.peelRadius);
  const photoreal = useAtlas((s) => s.photoreal);
  const setPeel = useAtlas((s) => s.setPeel);
  const setDissection = useAtlas((s) => s.setDissection);

  const appearance = appearanceById(appearanceId ?? "julian");
  const gltf = useGLTF("/models/systems/integument.glb");
  const [albedo, normal] = useTexture([appearance.albedo, appearance.normal]);
  const albedoMap = useMemo(() => {
    const texture = albedo.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(2.4, 2.4);
    texture.needsUpdate = true;
    return texture;
  }, [albedo]);
  const normalMap = useMemo(() => {
    const texture = normal.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3.2, 3.2);
    texture.needsUpdate = true;
    return texture;
  }, [normal]);

  const uniforms = useRef<PeelUniforms>({
    uDissection: { value: 0 },
    uWindowCenter: { value: new THREE.Vector3() },
    uWindowRadius: { value: 0.12 },
    uHairColor: { value: new THREE.Color(appearance.hair) },
    uHasWindow: { value: 0 },
  });

  useFrame(() => {
    const u = uniforms.current;
    u.uDissection.value = dissection;
    u.uWindowRadius.value = peelRadius;
    u.uHairColor.value.set(appearance.hair);
    u.uHasWindow.value = peelCenter ? 1 : 0;
    if (peelCenter) u.uWindowCenter.value.set(...peelCenter);
  });

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: appearance.skinTint,
      map: albedoMap,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.42 + appearance.melanin * 0.12,
      metalness: 0,
      sheen: 0.55,
      sheenColor: new THREE.Color(appearance.sheen),
      sheenRoughness: 0.45,
      clearcoat: 0.12,
      clearcoatRoughness: 0.55,
      thickness: 0.6,
      attenuationDistance: 0.12,
      attenuationColor: new THREE.Color(appearance.attenuation),
      ior: 1.4,
      envMapIntensity: 0.9,
      side: THREE.FrontSide,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uDissection = uniforms.current.uDissection;
      shader.uniforms.uWindowCenter = uniforms.current.uWindowCenter;
      shader.uniforms.uWindowRadius = uniforms.current.uWindowRadius;
      shader.uniforms.uHairColor = uniforms.current.uHairColor;
      shader.uniforms.uHasWindow = uniforms.current.uHasWindow;
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
           uniform vec3 uHairColor;
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
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
           float windowAmt2 = 0.0;
           if (uHasWindow > 0.5) {
             windowAmt2 = 1.0 - smoothstep(uWindowRadius * 0.45, uWindowRadius, distance(vAtlasWorld, uWindowCenter));
           }
           float peel2 = max(uDissection, windowAmt2);
           float scalp = smoothstep(1.50, 1.62, vAtlasWorld.y) *
             (1.0 - smoothstep(0.09, 0.15, length(vAtlasWorld.xz)));
           diffuseColor.rgb = mix(diffuseColor.rgb, uHairColor, scalp * 0.94);
           diffuseColor.a *= (1.0 - peel2 * 0.35);`,
        );
    };
    mat.customProgramCacheKey = () => `peel-${appearance.id}`;
    return mat;
  }, [albedoMap, appearance, normalMap]);

  useLayoutEffect(() => {
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const isSkin = mesh.name === "FJ2810";
      mesh.visible = isSkin;
      if (!isSkin) return;
      mesh.material = material;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
    });
  }, [gltf.scene, material]);

  if (!photoreal) return null;

  return (
    <primitive
      object={gltf.scene}
      onPointerDown={(event: { point: THREE.Vector3; stopPropagation: () => void }) => {
        event.stopPropagation();
        setPeel([event.point.x, event.point.y, event.point.z], 0.14);
        if (dissection < 0.1) setDissection(0.18);
      }}
    />
  );
}

useGLTF.preload("/models/systems/integument.glb");
