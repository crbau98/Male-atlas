"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import catalog from "@/data/catalog.json";
import { useAtlas } from "@/lib/atlas-store";
import { SYSTEM_META, systemVisibleAtDepth, type SystemId } from "@/lib/systems";
import type { CatalogPart } from "@/lib/types";

const partsById = new Map(
  (catalog.parts as CatalogPart[]).map((part) => [part.id, part]),
);

const BRAINISH = /brain|gyrus|cortex|hippocamp|thalam|cerebell|brainstem|ventricle of brain|cerebral|white matter|forebrain|midbrain|hindbrain|hypothalamus|epithalamus|pons|medulla/i;

export function AnatomyLayers() {
  const photoreal = useAtlas((s) => s.photoreal);
  const systems = (catalog.systems as string[]).filter(
    (s) => !photoreal || s !== "integument",
  );
  return (
    <>
      {systems.map((system) => (
        <SystemMeshes key={system} system={system} />
      ))}
    </>
  );
}

function SystemMeshes({ system }: { system: string }) {
  const gltf = useGLTF(`/models/systems/${system}.glb`);
  const dissection = useAtlas((s) => s.dissection);
  const explode = useAtlas((s) => s.explode);
  const selectedId = useAtlas((s) => s.selectedId);
  const hoveredId = useAtlas((s) => s.hoveredId);
  const isolated = useAtlas((s) => s.isolated);
  const hidden = useAtlas((s) => s.hidden);
  const systemOn = useAtlas((s) => s.systemOn);
  const photoreal = useAtlas((s) => s.photoreal);
  const brainFocus = useAtlas((s) => s.brainFocus);
  const peelCenter = useAtlas((s) => s.peelCenter);
  const clipEnabled = useAtlas((s) => s.clipEnabled);
  const clipY = useAtlas((s) => s.clipY);
  const select = useAtlas((s) => s.select);
  const hover = useAtlas((s) => s.hover);

  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), clipY),
    [clipY],
  );

  const origins = useRef(new Map<string, THREE.Vector3>());
  const color = useMemo(() => {
    const hex = SYSTEM_META[system as SystemId]?.color ?? "#aaaaaa";
    return new THREE.Color(hex);
  }, [system]);

  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness: system === "skeletal" ? 0.55 : 0.38,
      metalness: 0,
      clearcoat: system === "skeletal" ? 0.15 : 0.04,
      sheen: system === "muscular" ? 0.2 : 0,
      envMapIntensity: 0.65,
      side: THREE.DoubleSide,
    });
  }, [color, system]);

  useLayoutEffect(() => {
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = material.clone();
      const cloned = mesh.material as THREE.MeshPhysicalMaterial;
      cloned.clippingPlanes = clipEnabled ? [clipPlane] : [];
      cloned.clipShadows = true;
      mesh.castShadow = false;
      if (!origins.current.has(mesh.uuid)) {
        mesh.geometry.computeBoundingBox();
        const c = new THREE.Vector3();
        mesh.geometry.boundingBox?.getCenter(c);
        origins.current.set(mesh.uuid, c);
      }
    });
  }, [clipEnabled, clipPlane, clipY, gltf.scene, material]);

  const depthVisible = !photoreal || dissection > 0.05 || Boolean(peelCenter);
  const systemEnabled = systemOn[system] !== false;
  const showSystem =
    systemEnabled &&
    depthVisible &&
    (photoreal ? systemVisibleAtDepth(system, dissection) || dissection > 0.12 : true);

  useLayoutEffect(() => {
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const part = partsById.get(mesh.name);
      const origin = origins.current.get(mesh.uuid);
      if (origin && explode > 0) {
        mesh.position.copy(origin).multiplyScalar(explode * 1.8);
      } else {
        mesh.position.set(0, 0, 0);
      }

      const isBrain = part ? BRAINISH.test(part.name) : false;
      const hiddenPart = hidden.has(mesh.name);
      const isolatedAway = isolated && selectedId && mesh.name !== selectedId;
      const brainAway = brainFocus && system === "nervous" ? !isBrain : brainFocus && system !== "nervous";
      mesh.visible = showSystem && !hiddenPart && !isolatedAway && !brainAway;

      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      const active = mesh.name === selectedId || mesh.name === hoveredId;
      mat.emissive = new THREE.Color(active ? "#c4a46c" : "#000000");
      mat.emissiveIntensity = mesh.name === selectedId ? 0.55 : mesh.name === hoveredId ? 0.28 : 0;
      mat.clippingPlanes = clipEnabled ? [clipPlane] : [];
      mat.transparent = dissection > 0.75 && system !== "skeletal" && system !== "nervous";
      mat.opacity = mat.transparent ? 0.35 : 1;
    });
  }, [
    brainFocus,
    clipEnabled,
    clipPlane,
    clipY,
    dissection,
    explode,
    gltf.scene,
    hidden,
    hoveredId,
    isolated,
    selectedId,
    showSystem,
    system,
  ]);

  return (
    <primitive
      object={gltf.scene}
      onPointerOver={(event: { object: THREE.Object3D; stopPropagation: () => void }) => {
        event.stopPropagation();
        hover(event.object.name);
      }}
      onPointerOut={() => hover(null)}
      onClick={(event: { object: THREE.Object3D; stopPropagation: () => void }) => {
        event.stopPropagation();
        select(event.object.name);
      }}
    />
  );
}

for (const system of catalog.systems as string[]) {
  if (system === "integument") continue;
  useGLTF.preload(`/models/systems/${system}.glb`);
}
