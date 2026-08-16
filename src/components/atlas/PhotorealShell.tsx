"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { appearanceById } from "@/lib/appearances";
import { useAtlas } from "@/lib/atlas-store";
import { pickGenitalFromPoint } from "@/lib/genital-parts";
import { injectPeelShader } from "@/lib/peel-shader";
import { tapPart } from "@/lib/tap-part";

export function PhotorealShell() {
  const appearanceId = useAtlas((s) => s.appearanceId);
  const dissection = useAtlas((s) => s.dissection);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const peelRadius = useAtlas((s) => s.peelRadius);
  const photoreal = useAtlas((s) => s.photoreal);
  const setPeel = useAtlas((s) => s.setPeel);
  const setDissection = useAtlas((s) => s.setDissection);
  const setPeelRadius = useAtlas((s) => s.setPeelRadius);
  const lookAt = useAtlas((s) => s.lookAt);
  const hold = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHold = () => {
    if (hold.current) {
      clearInterval(hold.current);
      hold.current = null;
    }
  };

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

  const uniforms = useRef({
    uDissection: { value: 0 },
    uWindowCenter: { value: new THREE.Vector3() },
    uWindowRadius: { value: 0.12 },
    uHairColor: { value: new THREE.Color(appearance.hair) },
    uSkinTint: { value: new THREE.Color(appearance.skinTint) },
    uMelanin: { value: appearance.melanin },
    uHasWindow: { value: 0 },
  });

  useFrame(() => {
    const u = uniforms.current;
    u.uDissection.value = dissection;
    u.uWindowRadius.value = peelRadius;
    u.uHairColor.value.set(appearance.hair);
    u.uSkinTint.value.set(appearance.skinTint);
    u.uMelanin.value = appearance.melanin;
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
      injectPeelShader(shader, uniforms.current);
      shader.uniforms.uHairColor = uniforms.current.uHairColor;
      shader.uniforms.uSkinTint = uniforms.current.uSkinTint;
      shader.uniforms.uMelanin = uniforms.current.uMelanin;
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "uniform float uHasWindow;",
          `uniform float uHasWindow;
           uniform vec3 uHairColor;
           uniform vec3 uSkinTint;
           uniform float uMelanin;`,
        )
        .replace(
          "if (peel > 0.88) discard;",
          `if (peel > 0.88) discard;
           float axPenis = abs(vAtlasWorld.x);
           float penisCover = (1.0 - smoothstep(0.020, 0.044, axPenis))
             * smoothstep(0.776, 0.788, vAtlasWorld.y)
             * (1.0 - smoothstep(0.848, 0.875, vAtlasWorld.y))
             * smoothstep(0.150, 0.168, vAtlasWorld.z);
           if (penisCover > 0.58) discard;`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
           float axSkin = abs(vAtlasWorld.x);
           float scalp = smoothstep(1.50, 1.62, vAtlasWorld.y) *
             (1.0 - smoothstep(0.09, 0.15, length(vAtlasWorld.xz)));
           float pubic = smoothstep(0.82, 0.86, vAtlasWorld.y) * (1.0 - smoothstep(0.92, 0.98, vAtlasWorld.y)) *
             (1.0 - smoothstep(0.05, 0.11, axSkin)) *
             smoothstep(0.07, 0.12, vAtlasWorld.z);
           float scrotum = (1.0 - smoothstep(0.036, 0.058, axSkin))
             * smoothstep(0.750, 0.766, vAtlasWorld.y)
             * (1.0 - smoothstep(0.792, 0.810, vAtlasWorld.y))
             * smoothstep(0.122, 0.142, vAtlasWorld.z)
             * (1.0 - smoothstep(0.172, 0.190, vAtlasWorld.z));
           float n = fract(sin(dot(vAtlasWorld.xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
           vec3 scrotumCol = mix(uSkinTint, vec3(0.38, 0.24, 0.18), 0.28 + uMelanin * 0.18);
           diffuseColor.rgb = mix(diffuseColor.rgb, scrotumCol, scrotum * 0.92);
           float raphe = (1.0 - smoothstep(0.0012, 0.0048, axSkin)) * scrotum;
           diffuseColor.rgb = mix(diffuseColor.rgb, scrotumCol * 0.68, raphe);
           diffuseColor.rgb = mix(diffuseColor.rgb, uHairColor, scalp * 0.94);
           diffuseColor.rgb = mix(diffuseColor.rgb, uHairColor, pubic * (0.58 + 0.42 * n));`,
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
      onPointerDown={(event: {
        point: THREE.Vector3;
        stopPropagation: () => void;
      }) => {
        event.stopPropagation();
        const genital = pickGenitalFromPoint(event.point.x, event.point.y, event.point.z);
        const point: [number, number, number] = [event.point.x, event.point.y, event.point.z];
        if (genital) tapPart(genital, point);
        else lookAt(point, [point[0] + 0.22, point[1] + 0.08, point[2] + 0.42]);
        setPeel(point, genital ? 0.1 : 0.14);
        if (dissection < 0.1) setDissection(genital ? 0.22 : 0.18);
        stopHold();
        hold.current = setInterval(() => {
          const radius = useAtlas.getState().peelRadius;
          setPeelRadius(Math.min(0.32, radius + 0.012));
        }, 70);
      }}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
    />
  );
}

useGLTF.preload("/models/systems/integument.glb");
