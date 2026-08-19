"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { appearanceById } from "@/lib/appearances";
import { useAtlas } from "@/lib/atlas-store";
import {
  GENITAL_ROOT,
  SHAFT_LENGTH,
  createGlansGeometry,
  createScrotumGeometry,
  createShaftGeometry,
} from "@/lib/genital-geometry";
import { injectGenitalSkin } from "@/lib/genital-shader";
import { livingRuntime } from "@/lib/living-runtime";
import { pulseHaptic } from "@/lib/living-touch";
import { useClipPlanes } from "@/lib/use-clip-planes";

const FRONT_URL = "/skins/photoreal-front.png";

export function PhotorealGenitals() {
  const appearanceId = useAtlas((s) => s.appearanceId);
  const appearance = appearanceById(appearanceId ?? "julian");

  const albedo = useTexture(appearance.albedo, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
  });

  const normalMap = useTexture(appearance.normal, (tex) => {
    tex.flipY = false;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
  });

  const roughnessMap = useTexture(appearance.roughness, (tex) => {
    tex.flipY = false;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
  });

  const frontMap = useTexture(FRONT_URL, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = true;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
  });

  const selectedId = useAtlas((s) => s.selectedId);
  const hoveredId = useAtlas((s) => s.hoveredId);
  const hover = useAtlas((s) => s.hover);
  const planes = useClipPlanes();

  const shaftGroup = useRef<THREE.Group>(null);
  const shaftMesh = useRef<THREE.Mesh>(null);
  const glansMesh = useRef<THREE.Mesh>(null);
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

  const onBeforeCompileShaft = (shader: {
    vertexShader: string;
    fragmentShader: string;
    uniforms: Record<string, THREE.IUniform>;
  }) => {
    injectGenitalSkin(shader, {
      uArousal: living.current.uArousal,
      uPhysiology: living.current.uPhysiology,
      uPart: living.current.uPartShaft,
      uFrontMap: living.current.uFrontMap,
    });
  };

  const onBeforeCompileGlans = (shader: {
    vertexShader: string;
    fragmentShader: string;
    uniforms: Record<string, THREE.IUniform>;
  }) => {
    injectGenitalSkin(shader, {
      uArousal: living.current.uArousal,
      uPhysiology: living.current.uPhysiology,
      uPart: living.current.uPartGlans,
      uFrontMap: living.current.uFrontMap,
    });
  };

  const onBeforeCompileScrotum = (shader: {
    vertexShader: string;
    fragmentShader: string;
    uniforms: Record<string, THREE.IUniform>;
  }) => {
    injectGenitalSkin(shader, {
      uArousal: living.current.uArousal,
      uPhysiology: living.current.uPhysiology,
      uPart: living.current.uPartScrotum,
      uFrontMap: living.current.uFrontMap,
    });
  };

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
    flush.current = THREE.MathUtils.damp(flush.current, aroused, 2.2, delta);
    const a = flush.current;

    living.current.uArousal.value = a;
    living.current.uPhysiology.value = phys;
    living.current.uFrontMap.value = frontMap;

    const group = shaftGroup.current;
    if (group) {
      // Flaccid (downward angled ~75 deg) to fully erect (upright horizontal/elevated forward projection ~3.5 deg)
      group.rotation.x = THREE.MathUtils.damp(
        group.rotation.x,
        THREE.MathUtils.lerp(1.30, 0.06, a),
        2.4,
        delta,
      );
    }

    const sMesh = shaftMesh.current;
    const gMesh = glansMesh.current;
    if (sMesh && gMesh) {
      const girth = 1 + a * 0.40;
      const length = 1 + a * 0.85;
      sMesh.scale.set(girth, length, girth);

      // Decoupled glans scaling: expands in coronal diameter & hyperemia flare without excess axial stretching
      gMesh.position.y = SHAFT_LENGTH * length;
      const glansGirth = girth * (1 + a * 0.15);
      const glansLength = 1 + a * 0.20;
      gMesh.scale.set(glansGirth, glansLength, glansGirth);
    }

    const sac = scrotumRef.current;
    if (sac) {
      // Dartos contraction & cremasteric testicular elevation
      const tighten = 1 - a * 0.22;
      sac.scale.set(tighten * (1 + a * 0.08), tighten, tighten);
      sac.position.y = THREE.MathUtils.damp(sac.position.y, 0.006 + a * 0.022, 2.4, delta);
    }
  });

  return (
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
        applyStroke(event.point, event.object.name, 0.06);
        pulseHaptic("pelvis");
      }}
      onPointerMove={(event) => {
        if (!stroke.current.down) return;
        const native = event.nativeEvent as PointerEvent;
        const step = Math.hypot(native.clientX - stroke.current.x, native.clientY - stroke.current.y);
        stroke.current.x = native.clientX;
        stroke.current.y = native.clientY;
        applyStroke(event.point, event.object.name, Math.min(0.12, 0.02 + step / 140));
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
        applyStroke(event.point, event.object.name, 0.14);
        pulseHaptic("pelvis");
      }}
    >
      <group ref={shaftGroup}>
        <mesh ref={shaftMesh} name="FJ3132" geometry={shaftGeo} castShadow receiveShadow>
          <meshPhysicalMaterial
            map={albedo}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.24, 0.24)}
            roughnessMap={roughnessMap}
            color={appearance.skinTint}
            roughness={0.50}
            metalness={0}
            sheen={0.20}
            sheenColor={appearance.sheen}
            sheenRoughness={0.52}
            clearcoat={0.04}
            clearcoatRoughness={0.4}
            envMapIntensity={0.20}
            clippingPlanes={planes}
            clipShadows
            emissive={selectedId === "FJ3132" || hoveredId === "FJ3132" ? "#c4a46c" : "#000000"}
            emissiveIntensity={selectedId === "FJ3132" ? 0.35 : hoveredId === "FJ3132" ? 0.16 : 0}
            onBeforeCompile={onBeforeCompileShaft}
            customProgramCacheKey={() => `genital-shaft-v7-${appearance.id}`}
          />
        </mesh>
        <mesh ref={glansMesh} name="FJ3134" geometry={glansGeo} position={[0, SHAFT_LENGTH, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            map={albedo}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.18, 0.18)}
            roughnessMap={roughnessMap}
            color="#c6746e"
            roughness={0.28}
            metalness={0}
            sheen={0.32}
            sheenColor={appearance.sheen}
            sheenRoughness={0.36}
            clearcoat={0.12}
            clearcoatRoughness={0.35}
            envMapIntensity={0.25}
            clippingPlanes={planes}
            clipShadows
            emissive={selectedId === "FJ3134" || hoveredId === "FJ3134" ? "#c4a46c" : "#000000"}
            emissiveIntensity={selectedId === "FJ3134" ? 0.35 : hoveredId === "FJ3134" ? 0.16 : 0}
            onBeforeCompile={onBeforeCompileGlans}
            customProgramCacheKey={() => `genital-glans-v7-${appearance.id}`}
          />
        </mesh>
      </group>
      <mesh ref={scrotumRef} name="scrotum" geometry={scrotumGeo} position={[0, 0.006, 0.006]} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={albedo}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.32, 0.32)}
          roughnessMap={roughnessMap}
          color={appearance.skinTint}
          roughness={0.58}
          metalness={0}
          sheen={0.16}
          sheenColor={appearance.sheen}
          sheenRoughness={0.58}
          envMapIntensity={0.16}
          clippingPlanes={planes}
          clipShadows
          emissive={selectedId === "scrotum" || hoveredId === "scrotum" ? "#c4a46c" : "#000000"}
          emissiveIntensity={selectedId === "scrotum" ? 0.35 : hoveredId === "scrotum" ? 0.16 : 0}
          onBeforeCompile={onBeforeCompileScrotum}
          customProgramCacheKey={() => `genital-scrotum-v7-${appearance.id}`}
        />
      </mesh>
    </group>
  );
}

useTexture.preload(FRONT_URL);
