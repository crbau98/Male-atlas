"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAtlas } from "@/lib/atlas-store";
import { injectPeelShader } from "@/lib/peel-shader";
import { useClipPlanes } from "@/lib/use-clip-planes";

export function GhostShell() {
  const dissection = useAtlas((s) => s.dissection);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const peelRadius = useAtlas((s) => s.peelRadius);
  const photoreal = useAtlas((s) => s.photoreal);
  const gltf = useGLTF("/models/photoreal-male.glb");
  const planes = useClipPlanes();
  const lastPeel = useRef("");
  const matRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const uniforms = useRef({
    uDissection: { value: 0 },
    uWindowCenter: { value: new THREE.Vector3() },
    uWindowRadius: { value: 0 },
    uHasWindow: { value: 0 },
    uInvertPeel: { value: 1 },
  });

  const geometry = useMemo(() => {
    let geo: THREE.BufferGeometry | undefined;
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.name === "PhotorealMale") geo = mesh.geometry;
    });
    return geo;
  }, [gltf.scene]);

  const onBeforeCompile = useCallback(
    (shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, THREE.IUniform> }) => {
      injectPeelShader(shader, uniforms.current);
    },
    [],
  );

  useFrame((_, delta) => {
    const u = uniforms.current;
    u.uDissection.value = THREE.MathUtils.damp(u.uDissection.value, dissection, 3.4, delta);
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
    const mat = matRef.current;
    if (mat) {
      const target = peelCenter || dissection > 0.08 ? 0.22 : 0;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, target, 5, delta);
    }
  });

  if (!photoreal || !geometry) return null;
  if (dissection < 0.04 && !peelCenter) return null;

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={2} raycast={() => undefined}>
      <meshPhysicalMaterial
        ref={matRef}
        color="#d7c4b2"
        roughness={0.7}
        metalness={0}
        transparent
        opacity={0.2}
        side={THREE.BackSide}
        depthWrite={false}
        envMapIntensity={0.25}
        clippingPlanes={planes}
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  );
}
