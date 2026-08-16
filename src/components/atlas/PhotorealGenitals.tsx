"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { appearanceById } from "@/lib/appearances";
import { useAtlas } from "@/lib/atlas-store";
import {
  GENITAL_ANATOMY_COLOR,
  GENITAL_INNER_IDS,
  GENITAL_MESH_IDS,
  isPelvisPoint,
} from "@/lib/genital-parts";
import {
  GENITAL_ROOT,
  SHAFT_LENGTH,
  createGlansGeometry,
  createScrotumGeometry,
  createShaftGeometry,
} from "@/lib/genital-geometry";
import { injectGenitalSkin } from "@/lib/genital-shader";
import { injectPeelShader } from "@/lib/peel-shader";
import { injectIllustrationShader } from "@/lib/plate-shader";
import { livingRuntime } from "@/lib/living-runtime";
import { pulseHaptic } from "@/lib/living-touch";
import { tapPart } from "@/lib/tap-part";
import { useClipPlanes } from "@/lib/use-clip-planes";

const GENITAL_ALBEDO = "/skins/photoreal-genital-albedo.png";
const FRONT_URL = "/skins/photoreal-front.png";

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
  const albedo = useTexture(GENITAL_ALBEDO, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
  });
  const frontMap = useTexture(FRONT_URL, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = true;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
  });
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
  const inner = useRef<THREE.Group>(null);
  const shaftGroup = useRef<THREE.Group>(null);
  const scrotumRef = useRef<THREE.Mesh>(null);
  const flush = useRef(0);
  const stroke = useRef({ x: 0, y: 0, down: false });
  const living = useRef({
    uArousal: { value: 0 },
    uPhysiology: { value: 1 },
    uPartShaft: { value: 0 },
    uPartGlans: { value: 1 },
    uPartScrotum: { value: 2 },
    uFrontMap: { value: frontMap as THREE.Texture | null },
  });

  const shaftGeo = useMemo(() => createShaftGeometry(), []);
  const glansGeo = useMemo(() => createGlansGeometry(), []);
  const scrotumGeo = useMemo(() => createScrotumGeometry(), []);

  const innerGeos = useMemo(() => {
    const out = new Map<string, THREE.BufferGeometry>();
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !GENITAL_MESH_IDS.has(mesh.name)) return;
      if (!GENITAL_INNER_IDS.has(mesh.name)) return;
      out.set(mesh.name, mesh.geometry);
    });
    return out;
  }, [gltf.scene]);

  const showInner = !photoreal || dissection >= 0.16 || isPelvisPoint(peelCenter);
  const showSurface = photoreal && dissection < 0.72;
  const onBeforeCompileNude = useCallback(
    (shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, THREE.IUniform> }) => {
      injectPeelShader(shader, uniforms.current);
      injectGenitalSkin(shader, {
        uArousal: living.current.uArousal,
        uPhysiology: living.current.uPhysiology,
        uPart: living.current.uPartShaft,
        uFrontMap: living.current.uFrontMap,
      });
    },
    []
  );
  const onBeforeCompileGlans = useCallback(
    (shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, THREE.IUniform> }) => {
      injectPeelShader(shader, uniforms.current);
      injectGenitalSkin(shader, {
        uArousal: living.current.uArousal,
        uPhysiology: living.current.uPhysiology,
        uPart: living.current.uPartGlans,
        uFrontMap: living.current.uFrontMap,
      });
    },
    []
  );
  const onBeforeCompileScrotum = useCallback(
    (shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, THREE.IUniform> }) => {
      injectPeelShader(shader, uniforms.current);
      injectGenitalSkin(shader, {
        uArousal: living.current.uArousal,
        uPhysiology: living.current.uPhysiology,
        uPart: living.current.uPartScrotum,
        uFrontMap: living.current.uFrontMap,
      });
    },
    []
  );
  const onBeforeCompilePlate = useCallback(
    (shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, THREE.IUniform> }) => {
      injectIllustrationShader(shader, "viscera");
    },
    [],
  );

  const applyStroke = (point: THREE.Vector3, name: string, amount: number) => {
    if (!useAtlas.getState().physiologyOn) return;
    livingRuntime.apply(
      point.x,
      point.y,
      point.z,
      name,
      amount,
      useAtlas.getState().physiologyIntensity,
    );
  };

  useFrame((_, delta) => {
    const phys = useAtlas.getState().physiologyOn ? useAtlas.getState().physiologyIntensity : 0;
    const aroused = phys > 0 ? livingRuntime.arousal : 0;
    flush.current = THREE.MathUtils.damp(flush.current, aroused, 2.1, delta);
    const a = flush.current;
    living.current.uArousal.value = a;
    living.current.uPhysiology.value = phys;
    living.current.uFrontMap.value = frontMap;
    const shaft = shaftGroup.current;
    if (shaft) {
      shaft.rotation.x = THREE.MathUtils.damp(shaft.rotation.x, THREE.MathUtils.lerp(1.22, 0.22, a), 2.4, delta);
      const girth = 1 + a * 0.22;
      const length = 1 + a * 0.58;
      shaft.scale.set(girth, length, girth);
    }
    const sac = scrotumRef.current;
    if (sac) {
      const tighten = 1 - a * 0.16;
      sac.scale.set(tighten * (1 + a * 0.04), tighten, tighten);
      sac.position.y = THREE.MathUtils.damp(sac.position.y, 0.006 + a * 0.014, 2.4, delta);
    }
  });

  return (
    <group>
      {showSurface ? (
        <group
          position={GENITAL_ROOT}
          onPointerOver={(event) => {
            event.stopPropagation();
            hover(event.object.name);
          }}
          onPointerOut={() => hover(null)}
          onPointerDown={(event) => {
            const native = event.nativeEvent as PointerEvent;
            (native.target as Element | null)?.setPointerCapture?.(native.pointerId);
            stroke.current = { x: native.clientX, y: native.clientY, down: true };
            applyStroke(event.point, event.object.name, 0.05);
            pulseHaptic("pelvis");
          }}
          onPointerMove={(event) => {
            if (!stroke.current.down) return;
            const native = event.nativeEvent as PointerEvent;
            const step = Math.hypot(native.clientX - stroke.current.x, native.clientY - stroke.current.y);
            stroke.current.x = native.clientX;
            stroke.current.y = native.clientY;
            applyStroke(event.point, event.object.name, Math.min(0.1, 0.02 + step / 150));
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
          <group ref={shaftGroup}>
            <mesh name="FJ3132" geometry={shaftGeo} castShadow receiveShadow>
              <meshPhysicalMaterial
                map={albedo}
                color={appearance.skinTint}
                roughness={0.52}
                metalness={0}
                sheen={0.18}
                sheenColor={appearance.sheen}
                sheenRoughness={0.55}
                clearcoat={0}
                envMapIntensity={0.16}
                clippingPlanes={planes}
                clipShadows
                emissive={selectedId === "FJ3132" || hoveredId === "FJ3132" ? "#c4a46c" : "#000000"}
                emissiveIntensity={selectedId === "FJ3132" ? 0.4 : hoveredId === "FJ3132" ? 0.18 : 0}
                onBeforeCompile={onBeforeCompileNude}
                customProgramCacheKey={() => "genital-shaft-v2"}
              />
            </mesh>
            <mesh name="FJ3134" geometry={glansGeo} position={[0, SHAFT_LENGTH, 0]} castShadow receiveShadow>
              <meshPhysicalMaterial
                map={albedo}
                color="#c47872"
                roughness={0.32}
                metalness={0}
                sheen={0.28}
                sheenColor={appearance.sheen}
                sheenRoughness={0.4}
                clearcoat={0.08}
                clearcoatRoughness={0.45}
                envMapIntensity={0.2}
                clippingPlanes={planes}
                clipShadows
                emissive={selectedId === "FJ3134" || hoveredId === "FJ3134" ? "#c4a46c" : "#000000"}
                emissiveIntensity={selectedId === "FJ3134" ? 0.4 : hoveredId === "FJ3134" ? 0.18 : 0}
                onBeforeCompile={onBeforeCompileGlans}
                customProgramCacheKey={() => "genital-glans-v2"}
              />
            </mesh>
          </group>
          <mesh ref={scrotumRef} name="scrotum" geometry={scrotumGeo} position={[0, 0.006, 0.006]} castShadow receiveShadow>
            <meshPhysicalMaterial
              map={albedo}
              color={appearance.skinTint}
              roughness={0.62}
              metalness={0}
              sheen={0.14}
              sheenColor={appearance.sheen}
              sheenRoughness={0.6}
              envMapIntensity={0.14}
              clippingPlanes={planes}
              clipShadows
              emissive={selectedId === "scrotum" || hoveredId === "scrotum" ? "#c4a46c" : "#000000"}
              emissiveIntensity={selectedId === "scrotum" ? 0.4 : hoveredId === "scrotum" ? 0.18 : 0}
              onBeforeCompile={onBeforeCompileScrotum}
              customProgramCacheKey={() => "genital-scrotum-v2"}
            />
          </mesh>
        </group>
      ) : null}

      <group ref={inner}>
        {[...innerGeos.entries()].map(([id, geometry]) => {
          const visible = showInner;
          const active = selectedId === id || hoveredId === id;
          const color = GENITAL_ANATOMY_COLOR[id] ?? "#c989a8";
          return (
            <mesh key={id} name={id} geometry={geometry} visible={visible} castShadow={false} receiveShadow>
              <meshPhysicalMaterial
                color={color}
                roughness={0.48}
                metalness={0}
                sheen={0.12}
                sheenColor="#e8c4b8"
                envMapIntensity={0.85}
                clippingPlanes={planes}
                clipShadows
                side={THREE.DoubleSide}
                emissive={active ? "#c4a46c" : "#000000"}
                emissiveIntensity={selectedId === id ? 0.5 : hoveredId === id ? 0.24 : 0}
                onBeforeCompile={onBeforeCompilePlate}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

useGLTF.preload("/models/systems/reproductive.glb");
useTexture.preload(GENITAL_ALBEDO);
useTexture.preload(FRONT_URL);
