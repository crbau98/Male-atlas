"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { appearanceById } from "@/lib/appearances";
import { useAtlas } from "@/lib/atlas-store";
import {
  GENITAL_ANATOMY_COLOR,
  GENITAL_INNER_IDS,
  GENITAL_MESH_IDS,
  GENITAL_SURFACE_IDS,
  isPelvisPoint,
} from "@/lib/genital-parts";
import { injectPeelShader } from "@/lib/peel-shader";
import { tapPart } from "@/lib/tap-part";

function inflateGeometry(geometry: THREE.BufferGeometry, amount: number) {
  const geo = geometry.clone();
  geo.computeVertexNormals();
  const pos = geo.attributes.position;
  const nrm = geo.attributes.normal;
  if (!nrm) return geo;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + nrm.getX(i) * amount,
      pos.getY(i) + nrm.getY(i) * amount,
      pos.getZ(i) + nrm.getZ(i) * amount,
    );
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function surfaceHex(id: string, skinTint: string) {
  const skin = new THREE.Color(skinTint);
  if (id === "FJ3134") {
    return `#${skin.lerp(new THREE.Color("#b85a5a"), 0.55).getHexString()}`;
  }
  return `#${skin.lerp(new THREE.Color("#c47a6a"), 0.28).getHexString()}`;
}

function usePeelUniforms() {
  const dissection = useAtlas((s) => s.dissection);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const peelRadius = useAtlas((s) => s.peelRadius);
  const uniforms = useRef({
    uDissection: { value: 0 },
    uWindowCenter: { value: new THREE.Vector3() },
    uWindowRadius: { value: 0.12 },
    uHasWindow: { value: 0 },
  });
  useFrame(() => {
    const u = uniforms.current;
    u.uDissection.value = dissection;
    u.uWindowRadius.value = peelRadius;
    u.uHasWindow.value = peelCenter ? 1 : 0;
    if (peelCenter) u.uWindowCenter.value.set(...peelCenter);
  });
  return uniforms;
}

export function PhotorealGenitals() {
  const gltf = useGLTF("/models/systems/reproductive.glb");
  const appearanceId = useAtlas((s) => s.appearanceId);
  const photoreal = useAtlas((s) => s.photoreal);
  const dissection = useAtlas((s) => s.dissection);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const selectedId = useAtlas((s) => s.selectedId);
  const hoveredId = useAtlas((s) => s.hoveredId);
  const hover = useAtlas((s) => s.hover);
  const appearance = appearanceById(appearanceId ?? "julian");
  const uniforms = usePeelUniforms();

  const geometries = useMemo(() => {
    const out = new Map<string, THREE.BufferGeometry>();
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !GENITAL_MESH_IDS.has(mesh.name)) return;
      const inflate = GENITAL_SURFACE_IDS.has(mesh.name)
        ? mesh.name === "FJ3134"
          ? 0.006
          : 0.005
        : 0;
      out.set(mesh.name, inflate ? inflateGeometry(mesh.geometry, inflate) : mesh.geometry);
    });
    return out;
  }, [gltf.scene]);

  const showInner = !photoreal || dissection >= 0.16 || isPelvisPoint(peelCenter);
  const showSurface = !photoreal || dissection < 0.72;
  const colors = useMemo(() => {
    const map = new Map<string, string>();
    for (const id of GENITAL_MESH_IDS) {
      const nude = photoreal && dissection < 0.38 && GENITAL_SURFACE_IDS.has(id);
      map.set(id, nude ? surfaceHex(id, appearance.skinTint) : (GENITAL_ANATOMY_COLOR[id] ?? "#c989a8"));
    }
    return map;
  }, [appearance.skinTint, dissection, photoreal]);
  const onBeforeCompile = useCallback(
    (shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, THREE.IUniform> }) => {
      injectPeelShader(shader, uniforms.current);
    },
    [uniforms],
  );

  return (
    <group
      onPointerOver={(event) => {
        event.stopPropagation();
        hover(event.object.name);
      }}
      onPointerOut={() => hover(null)}
      onClick={(event) => {
        event.stopPropagation();
        tapPart(event.object.name, [event.point.x, event.point.y, event.point.z]);
      }}
    >
      {[...geometries.entries()].map(([id, geometry]) => {
        const inner = GENITAL_INNER_IDS.has(id);
        const surface = GENITAL_SURFACE_IDS.has(id);
        const visible = (inner && showInner) || (surface && showSurface);
        const nude = photoreal && dissection < 0.38 && surface;
        const active = selectedId === id || hoveredId === id;
        const color = colors.get(id) ?? "#c989a8";
        return (
          <mesh key={id} name={id} geometry={geometry} visible={visible} castShadow={false} receiveShadow>
            <meshPhysicalMaterial
              color={color}
              roughness={nude ? (id === "FJ3134" ? 0.22 : 0.36) : 0.42}
              metalness={0}
              sheen={nude ? 0.45 : 0.15}
              sheenColor={nude ? appearance.sheen : "#e8c4b8"}
              clearcoat={nude && id === "FJ3134" ? 0.38 : 0.08}
              clearcoatRoughness={0.35}
              thickness={nude ? 0.55 : 0.2}
              attenuationColor={appearance.attenuation}
              attenuationDistance={0.08}
              envMapIntensity={0.85}
              side={THREE.DoubleSide}
              emissive={active ? "#c4a46c" : "#000000"}
              emissiveIntensity={selectedId === id ? 0.5 : hoveredId === id ? 0.24 : 0}
              onBeforeCompile={nude ? onBeforeCompile : undefined}
            />
          </mesh>
        );
      })}
    </group>
  );
}

useGLTF.preload("/models/systems/reproductive.glb");
