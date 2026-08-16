"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
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

function surfaceColor(id: string, skinTint: string) {
  const skin = new THREE.Color(skinTint);
  if (id === "FJ3134") return skin.clone().lerp(new THREE.Color("#b85a5a"), 0.55);
  return skin.clone().lerp(new THREE.Color("#c47a6a"), 0.28);
}

export function PhotorealGenitals() {
  const gltf = useGLTF("/models/systems/reproductive.glb");
  const appearanceId = useAtlas((s) => s.appearanceId);
  const photoreal = useAtlas((s) => s.photoreal);
  const dissection = useAtlas((s) => s.dissection);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const selectedId = useAtlas((s) => s.selectedId);
  const hoveredId = useAtlas((s) => s.hoveredId);
  const select = useAtlas((s) => s.select);
  const hover = useAtlas((s) => s.hover);
  const appearance = appearanceById(appearanceId ?? "julian");
  const uniforms = usePeelUniforms();

  const meshes = useMemo(() => {
    const out: THREE.Mesh[] = [];
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !GENITAL_MESH_IDS.has(mesh.name)) return;
      const clone = mesh.clone();
      const inflate = GENITAL_SURFACE_IDS.has(mesh.name)
        ? mesh.name === "FJ3134"
          ? 0.006
          : 0.005
        : 0;
      clone.geometry = inflate ? inflateGeometry(mesh.geometry, inflate) : mesh.geometry;
      clone.name = mesh.name;
      out.push(clone);
    });
    return out;
  }, [gltf.scene]);

  const materials = useMemo(() => {
    const map = new Map<string, THREE.MeshPhysicalMaterial>();
    for (const mesh of meshes) {
      const nude = photoreal && dissection < 0.38 && GENITAL_SURFACE_IDS.has(mesh.name);
      const color = nude
        ? surfaceColor(mesh.name, appearance.skinTint)
        : new THREE.Color(GENITAL_ANATOMY_COLOR[mesh.name] ?? "#c989a8");
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        roughness: nude ? (mesh.name === "FJ3134" ? 0.22 : 0.36) : 0.42,
        metalness: 0,
        sheen: nude ? 0.45 : 0.15,
        sheenColor: new THREE.Color(nude ? appearance.sheen : "#e8c4b8"),
        clearcoat: nude && mesh.name === "FJ3134" ? 0.38 : 0.08,
        clearcoatRoughness: 0.35,
        thickness: nude ? 0.55 : 0.2,
        attenuationColor: new THREE.Color(appearance.attenuation),
        attenuationDistance: 0.08,
        envMapIntensity: 0.85,
        side: THREE.DoubleSide,
      });
      if (nude) {
        mat.onBeforeCompile = (shader) => injectPeelShader(shader, uniforms.current);
        mat.customProgramCacheKey = () => `genital-peel-${mesh.name}-${appearance.id}`;
      }
      map.set(mesh.name, mat);
    }
    return map;
  }, [appearance, dissection, meshes, photoreal, uniforms]);

  const showInner = !photoreal || dissection >= 0.16 || isPelvisPoint(peelCenter);
  const showSurface = !photoreal || dissection < 0.72;

  useLayoutEffect(() => {
    for (const mesh of meshes) {
      const mat = materials.get(mesh.name);
      if (mat) mesh.material = mat;
      const inner = GENITAL_INNER_IDS.has(mesh.name);
      const surface = GENITAL_SURFACE_IDS.has(mesh.name);
      mesh.visible = (inner && showInner) || (surface && showSurface);
      mesh.castShadow = false;
      mesh.receiveShadow = true;
    }
  }, [materials, meshes, showInner, showSurface]);

  useLayoutEffect(() => {
    for (const mesh of meshes) {
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      const active = mesh.name === selectedId || mesh.name === hoveredId;
      mat.emissive = new THREE.Color(active ? "#c4a46c" : "#000000");
      mat.emissiveIntensity = mesh.name === selectedId ? 0.5 : mesh.name === hoveredId ? 0.24 : 0;
    }
  }, [hoveredId, meshes, selectedId]);

  return (
    <group
      onPointerOver={(event) => {
        event.stopPropagation();
        hover(event.object.name);
      }}
      onPointerOut={() => hover(null)}
      onClick={(event) => {
        event.stopPropagation();
        select(event.object.name);
      }}
    >
      {meshes.map((mesh) => (
        <primitive key={mesh.uuid} object={mesh} />
      ))}
    </group>
  );
}

useGLTF.preload("/models/systems/reproductive.glb");
