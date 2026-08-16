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
import { injectIllustrationShader } from "@/lib/plate-shader";
import { livingRuntime } from "@/lib/living-runtime";
import { pulseHaptic } from "@/lib/living-touch";
import { tapPart } from "@/lib/tap-part";
import { useClipPlanes } from "@/lib/use-clip-planes";

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
  useFrame((_, delta) => {
    const u = uniforms.current;
    u.uDissection.value = THREE.MathUtils.damp(u.uDissection.value, dissection, 3.4, delta);
    u.uWindowRadius.value = THREE.MathUtils.damp(
      u.uWindowRadius.value,
      peelCenter ? peelRadius : 0,
      4.2,
      delta,
    );
    u.uHasWindow.value = THREE.MathUtils.damp(u.uHasWindow.value, peelCenter ? 1 : 0, 5, delta);
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
  const planes = useClipPlanes();
  const group = useRef<THREE.Group>(null);
  const flush = useRef(0);
  const stroke = useRef({ x: 0, y: 0, down: false });

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
  const onBeforeCompileNude = useCallback(
    (shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, THREE.IUniform> }) => {
      injectPeelShader(shader, uniforms.current);
    },
    [uniforms],
  );
  const onBeforeCompilePlate = useCallback(
    (shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, THREE.IUniform> }) => {
      injectIllustrationShader(shader, "viscera");
    },
    [],
  );

  useFrame((_, delta) => {
    const aroused = useAtlas.getState().physiologyOn ? livingRuntime.arousal : 0;
    flush.current = THREE.MathUtils.damp(flush.current, aroused, 2.8, delta);
    const a = flush.current;
    const root = group.current;
    if (!root) return;
    const selected = useAtlas.getState().selectedId;
    const hovered = useAtlas.getState().hoveredId;
    for (const child of root.children) {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) continue;
      const shaft = mesh.name === "FJ3132";
      const glans = mesh.name === "FJ3134";
      const scrotum = mesh.name === "FJ3138" || mesh.name === "FJ3142";
      if (shaft || glans) {
        mesh.scale.set(1 + a * 0.16, 1 + a * (shaft ? 0.38 : 0.2), 1 + a * (shaft ? 0.48 : 0.28));
      } else if (scrotum) {
        mesh.scale.setScalar(1 + a * 0.1);
      }
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      if (mat?.isMaterial && (shaft || glans || mesh.name === "FJ3133")) {
        mat.sheen = (shaft || glans ? 0.7 : 0.12) + a * 0.35;
        mat.sheenRoughness = THREE.MathUtils.clamp((shaft || glans ? 0.28 : 0.5) - a * 0.12, 0.12, 0.55);
        if (selected !== mesh.name && hovered !== mesh.name) {
          mat.emissive.setRGB(0.38 * a, 0.07 * a, 0.1 * a);
          mat.emissiveIntensity = a * 0.42;
        }
      }
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={(event) => {
        event.stopPropagation();
        hover(event.object.name);
      }}
      onPointerOut={() => hover(null)}
      onPointerDown={(event) => {
        const native = event.nativeEvent as PointerEvent;
        (native.target as Element | null)?.setPointerCapture?.(native.pointerId);
        stroke.current = { x: native.clientX, y: native.clientY, down: true };
        const intensity = useAtlas.getState().physiologyIntensity;
        if (!useAtlas.getState().physiologyOn) return;
        livingRuntime.apply(
          event.point.x,
          event.point.y,
          event.point.z,
          event.object.name,
          0.045,
          intensity,
        );
        pulseHaptic("pelvis");
      }}
      onPointerMove={(event) => {
        if (!stroke.current.down) return;
        const native = event.nativeEvent as PointerEvent;
        const step = Math.hypot(native.clientX - stroke.current.x, native.clientY - stroke.current.y);
        stroke.current.x = native.clientX;
        stroke.current.y = native.clientY;
        if (!useAtlas.getState().physiologyOn) return;
        livingRuntime.apply(
          event.point.x,
          event.point.y,
          event.point.z,
          event.object.name,
          Math.min(0.1, 0.02 + step / 160),
          useAtlas.getState().physiologyIntensity,
        );
      }}
      onPointerUp={() => {
        stroke.current.down = false;
        livingRuntime.release();
      }}
      onPointerCancel={() => {
        stroke.current.down = false;
        livingRuntime.release();
      }}
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
              roughness={nude ? (id === "FJ3134" ? 0.16 : 0.32) : 0.48}
              metalness={0}
              sheen={nude ? 0.7 : 0.12}
              sheenColor={nude ? appearance.sheen : "#e8c4b8"}
              clearcoat={nude && id === "FJ3134" ? 0.32 : 0.08}
              clearcoatRoughness={nude && id === "FJ3134" ? 0.28 : 0.45}
              envMapIntensity={nude ? 1.05 : 0.85}
              clippingPlanes={planes}
              clipShadows
              side={THREE.DoubleSide}
              emissive={active ? "#c4a46c" : "#000000"}
              emissiveIntensity={selectedId === id ? 0.5 : hoveredId === id ? 0.24 : 0}
              onBeforeCompile={nude ? onBeforeCompileNude : onBeforeCompilePlate}
            />
          </mesh>
        );
      })}
    </group>
  );
}

useGLTF.preload("/models/systems/reproductive.glb");
