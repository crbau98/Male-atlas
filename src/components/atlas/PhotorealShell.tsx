"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { appearanceById } from "@/lib/appearances";
import { useAtlas } from "@/lib/atlas-store";
import { pickGenitalFromPoint } from "@/lib/genital-parts";
import { injectPeelShader } from "@/lib/peel-shader";
import { injectPhotorealSkin } from "@/lib/skin-shader";
import { closeupAmount } from "@/lib/skin-maps";
import { tapPart } from "@/lib/tap-part";
import { useClipPlanes } from "@/lib/use-clip-planes";

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
  const planes = useClipPlanes();
  const hold = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const uniforms = useRef({
    uDissection: { value: 0 },
    uWindowCenter: { value: new THREE.Vector3() },
    uWindowRadius: { value: 0 },
    uHairColor: { value: new THREE.Color(appearance.hair) },
    uSkinTint: { value: new THREE.Color(appearance.skinTint) },
    uMelanin: { value: appearance.melanin },
    uHasWindow: { value: 0 },
    uEyeColor: { value: new THREE.Color(appearance.eyes) },
    uSheenColor: { value: new THREE.Color(appearance.sheen) },
    uClose: { value: 0 },
    uInvertPeel: { value: 0 },
  });

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: appearance.skinTint,
      roughness: 0.38 + appearance.melanin * 0.08,
      metalness: 0,
      sheen: 0.72,
      sheenColor: new THREE.Color(appearance.sheen),
      sheenRoughness: 0.42,
      clearcoat: 0.04,
      clearcoatRoughness: 0.62,
      ior: 1.38,
      specularIntensity: 0.42,
      envMapIntensity: 0.88,
      side: THREE.FrontSide,
    });
    mat.onBeforeCompile = (shader) => {
      injectPeelShader(shader, uniforms.current);
      injectPhotorealSkin(shader, {
        uHairColor: uniforms.current.uHairColor,
        uSkinTint: uniforms.current.uSkinTint,
        uMelanin: uniforms.current.uMelanin,
        uEyeColor: uniforms.current.uEyeColor,
        uSheenColor: uniforms.current.uSheenColor,
        uClose: uniforms.current.uClose,
      });
    };
    mat.customProgramCacheKey = () => `skin-world-v3-${appearance.id}`;
    return mat;
  }, [appearance]);

  useLayoutEffect(() => {
    skinMat.current = material;
  }, [material]);

  useFrame((_, delta) => {
    const u = uniforms.current;
    u.uDissection.value = THREE.MathUtils.damp(u.uDissection.value, dissection, 3.4, delta);
    u.uHairColor.value.set(appearance.hair);
    u.uSkinTint.value.set(appearance.skinTint);
    u.uMelanin.value = appearance.melanin;
    u.uEyeColor.value.set(appearance.eyes);
    u.uSheenColor.value.set(appearance.sheen);
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
    u.uClose.value = closeAmt.current;
    const mat = skinMat.current;
    if (mat) {
      mat.envMapIntensity = 0.78 + closeAmt.current * 0.3;
      mat.sheen = 0.55 + closeAmt.current * 0.22;
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
      material.clippingPlanes = planes;
      material.clipShadows = true;
    });
  }, [gltf.scene, material, planes]);

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
