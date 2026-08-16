"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { appearanceById } from "@/lib/appearances";
import { useAtlas } from "@/lib/atlas-store";
import { pickGenitalFromPoint } from "@/lib/genital-parts";
import { injectPeelShader } from "@/lib/peel-shader";
import { closeupAmount, prepSkinMap } from "@/lib/skin-maps";
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
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const lastPeel = useRef<string>("");
  const closeAmt = useRef(0);
  const skinMat = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const stopHold = () => {
    if (hold.current) {
      clearInterval(hold.current);
      hold.current = null;
    }
  };

  const appearance = appearanceById(appearanceId ?? "julian");
  const gltf = useGLTF("/models/systems/integument.glb");
  const [albedo, normal, roughness] = useTexture([
    appearance.albedo,
    appearance.normal,
    appearance.roughness,
  ]);
  const anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
  const albedoMap = useMemo(
    () => prepSkinMap(albedo, true, anisotropy, 1),
    [albedo, anisotropy],
  );
  const normalMap = useMemo(
    () => prepSkinMap(normal, false, anisotropy, 2.15),
    [anisotropy, normal],
  );
  const roughnessMap = useMemo(
    () => prepSkinMap(roughness, false, anisotropy, 1),
    [anisotropy, roughness],
  );

  const uniforms = useRef({
    uDissection: { value: 0 },
    uWindowCenter: { value: new THREE.Vector3() },
    uWindowRadius: { value: 0 },
    uHairColor: { value: new THREE.Color(appearance.hair) },
    uSkinTint: { value: new THREE.Color(appearance.skinTint) },
    uMelanin: { value: appearance.melanin },
    uHasWindow: { value: 0 },
  });

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: appearance.skinTint,
      map: albedoMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      normalScale: new THREE.Vector2(0.16, 0.16),
      roughness: 0.46 + appearance.melanin * 0.06,
      metalness: 0,
      sheen: 0.58,
      sheenColor: new THREE.Color(appearance.sheen),
      sheenRoughness: 0.46,
      clearcoat: 0.06,
      clearcoatRoughness: 0.55,
      ior: 1.38,
      specularIntensity: 0.55,
      envMapIntensity: 0.92,
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
          "if (peel > 0.86 + peelEdge) discard;",
          `if (peel > 0.86 + peelEdge) discard;
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
           diffuseColor.rgb = mix(uSkinTint, diffuseColor.rgb, 0.86);
           float scalp = smoothstep(1.50, 1.61, vAtlasWorld.y) *
             (1.0 - smoothstep(0.08, 0.145, length(vAtlasWorld.xz)));
           float pubic = smoothstep(0.82, 0.86, vAtlasWorld.y) * (1.0 - smoothstep(0.92, 0.98, vAtlasWorld.y)) *
             (1.0 - smoothstep(0.05, 0.11, axSkin)) *
             smoothstep(0.07, 0.12, vAtlasWorld.z);
           float strand = 0.62 + 0.38 * smoothstep(0.35, 0.95, abs(sin(vAtlasWorld.x * 92.0 + vAtlasWorld.z * 18.0)));
           float scrotum = (1.0 - smoothstep(0.036, 0.058, axSkin))
             * smoothstep(0.750, 0.766, vAtlasWorld.y)
             * (1.0 - smoothstep(0.792, 0.810, vAtlasWorld.y))
             * smoothstep(0.122, 0.142, vAtlasWorld.z)
             * (1.0 - smoothstep(0.172, 0.190, vAtlasWorld.z));
           vec3 scrotumCol = mix(uSkinTint, vec3(0.38, 0.24, 0.18), 0.22 + uMelanin * 0.16);
           diffuseColor.rgb = mix(diffuseColor.rgb, scrotumCol, scrotum * 0.88);
           float raphe = (1.0 - smoothstep(0.0012, 0.0048, axSkin)) * scrotum;
           diffuseColor.rgb = mix(diffuseColor.rgb, scrotumCol * 0.72, raphe);
           diffuseColor.rgb = mix(diffuseColor.rgb, uHairColor, scalp * (0.72 + 0.28 * strand));
           diffuseColor.rgb = mix(diffuseColor.rgb, uHairColor, pubic * (0.45 + 0.4 * strand));`,
        );
    };
    mat.customProgramCacheKey = () => `peel-hq2-${appearance.id}`;
    return mat;
  }, [albedoMap, appearance, normalMap, roughnessMap]);

  useLayoutEffect(() => {
    skinMat.current = material;
  }, [material]);

  useFrame((_, delta) => {
    const u = uniforms.current;
    u.uDissection.value = THREE.MathUtils.damp(u.uDissection.value, dissection, 3.4, delta);
    u.uHairColor.value.set(appearance.hair);
    u.uSkinTint.value.set(appearance.skinTint);
    u.uMelanin.value = appearance.melanin;
    const key = peelCenter ? peelCenter.join(",") : "";
    if (key !== lastPeel.current) {
      lastPeel.current = key;
      if (peelCenter) u.uWindowRadius.value = 0.02;
    }
    u.uHasWindow.value = THREE.MathUtils.damp(u.uHasWindow.value, peelCenter ? 1 : 0, 5, delta);
    u.uWindowRadius.value = THREE.MathUtils.damp(
      u.uWindowRadius.value,
      peelCenter ? peelRadius : 0,
      4.2,
      delta,
    );
    if (peelCenter) u.uWindowCenter.value.set(...peelCenter);

    const orbit = controls as unknown as { target?: THREE.Vector3 } | null;
    const target = orbit?.target ?? new THREE.Vector3(0, 0.92, 0);
    const close = closeupAmount(camera.position.distanceTo(target));
    closeAmt.current = THREE.MathUtils.damp(closeAmt.current, close, 4, delta);
    const n = 0.1 + closeAmt.current * 0.34;
    const mat = skinMat.current;
    if (mat) {
      mat.normalScale.set(n, n);
      mat.envMapIntensity = 0.82 + closeAmt.current * 0.28;
      mat.sheen = 0.48 + closeAmt.current * 0.18;
    }
  });

  useLayoutEffect(() => {
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const isSkin = mesh.name === "FJ2810";
      mesh.visible = isSkin;
      if (!isSkin) return;
      mesh.geometry.computeVertexNormals();
      mesh.material = material;
      mesh.castShadow = true;
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
        else lookAt(point);
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
useGLTF.preload("/models/systems/muscular.glb");
useGLTF.preload("/models/systems/reproductive.glb");
