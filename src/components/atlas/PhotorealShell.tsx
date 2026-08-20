"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { appearanceById } from "@/lib/appearances";
import { useAtlas } from "@/lib/atlas-store";
import { pickGenitalFromPoint } from "@/lib/genital-parts";
import { livingRuntime } from "@/lib/living-runtime";
import { pulseHaptic } from "@/lib/living-touch";
import { injectPeelShader } from "@/lib/peel-shader";
import { injectEyeShader, injectPhotorealSkin } from "@/lib/skin-shader";
import { closeupAmount } from "@/lib/skin-maps";
import { useClipPlanes } from "@/lib/use-clip-planes";

const BODY_URL = "/models/photoreal-male.glb";
const ALBEDO_URL = "/skins/photoreal-male-albedo.png";
const FACE_URL = "/skins/photoreal-face.png";
const FRONT_URL = "/skins/photoreal-front.png";
const BACK_URL = "/skins/photoreal-back.png";

type PointerHit = {
  point: THREE.Vector3;
  nativeEvent: { clientX: number; clientY: number; pointerId: number; target: EventTarget | null };
};

export function PhotorealShell() {
  const appearanceId = useAtlas((s) => s.appearanceId);
  const photoreal = useAtlas((s) => s.photoreal);
  const physiologyOn = useAtlas((s) => s.physiologyOn);
  const physiologyIntensity = useAtlas((s) => s.physiologyIntensity);
  const breathingOn = useAtlas((s) => s.breathingOn);
  const setLiving = useAtlas((s) => s.setLiving);
  const planes = useClipPlanes();
  const hold = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdDelay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gesture = useRef({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    t: 0,
    point: [0, 0, 0] as [number, number, number],
    genital: null as string | null,
    dragged: false,
    peeled: false,
    down: false,
  });
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const closeAmt = useRef(0);
  const skinMat = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const touchTarget = useRef(0);
  const lastLivingSync = useRef(0);
  const lastHapticZone = useRef<string | null>(null);
  const eyes = useRef<THREE.Mesh[]>([]);
  const pupil = useRef(0);

  const stopHold = () => {
    if (hold.current) {
      clearInterval(hold.current);
      hold.current = null;
    }
    if (holdDelay.current) {
      clearTimeout(holdDelay.current);
      holdDelay.current = null;
    }
  };

  const appearance = appearanceById(appearanceId ?? "julian");
  const gltf = useGLTF(BODY_URL);
  const albedo = useTexture(appearance.albedo, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  });
  const faceMap = useTexture(appearance.portrait, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = true;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
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
    tex.needsUpdate = true;
  });
  const backMap = useTexture(BACK_URL, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = true;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  });

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
    uAttenuation: { value: new THREE.Color(appearance.attenuation) },
    uTouchPoint: { value: new THREE.Vector3(0, -10, 0) },
    uTouchStrength: { value: 0 },
    uPhysiology: { value: physiologyIntensity },
    uBreathPhase: { value: 0 },
    uMotionAmount: { value: 0 },
    uAffect: { value: 0 },
    uArousal: { value: 0 },
    uSmile: { value: 0 },
    uLid: { value: 0 },
    uJaw: { value: 0 },
    uBrow: { value: 0 },
    uFaceMap: { value: faceMap },
    uFrontMap: { value: frontMap },
    uBackMap: { value: backMap },
    uPupil: { value: 0 },
    uIris: { value: new THREE.Color(appearance.eyes) },
  });

  const eyeMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: "#f2f0ee",
      roughness: 0.12,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.2,
      ior: 1.4,
    });
    mat.onBeforeCompile = (shader) => {
      injectEyeShader(shader, {
        uPupil: uniforms.current.uPupil,
        uIris: uniforms.current.uIris,
      });
    };
    mat.customProgramCacheKey = () => `eye-photo-v1-${appearance.id}`;
    return mat;
  }, [appearance.id]);

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      map: albedo,
      normalMap,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughnessMap,
      roughness: 0.68 + appearance.melanin * 0.05,
      metalness: 0,
      sheen: 0.08,
      sheenColor: new THREE.Color(appearance.sheen),
      sheenRoughness: 0.68,
      clearcoat: 0.04,
      clearcoatRoughness: 0.45,
      ior: 1.42,
      specularIntensity: 0.08,
      envMapIntensity: 0.12,
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
        uAttenuation: uniforms.current.uAttenuation,
        uTouchPoint: uniforms.current.uTouchPoint,
        uTouchStrength: uniforms.current.uTouchStrength,
        uPhysiology: uniforms.current.uPhysiology,
        uBreathPhase: uniforms.current.uBreathPhase,
        uMotionAmount: uniforms.current.uMotionAmount,
        uAffect: uniforms.current.uAffect,
        uArousal: uniforms.current.uArousal,
        uSmile: uniforms.current.uSmile,
        uLid: uniforms.current.uLid,
        uJaw: uniforms.current.uJaw,
        uBrow: uniforms.current.uBrow,
        uFaceMap: uniforms.current.uFaceMap,
        uFrontMap: uniforms.current.uFrontMap,
        uBackMap: uniforms.current.uBackMap,
      });
    };
    mat.customProgramCacheKey = () => `skin-photo-v11-${appearance.id}`;
    return mat;
  }, [albedo, normalMap, roughnessMap, appearance]);

  useLayoutEffect(() => {
    skinMat.current = material;
  }, [material]);

  const strokeAt = (point: THREE.Vector3, genital: string | null, pixelStep: number) => {
    if (!useAtlas.getState().physiologyOn) return;
    uniforms.current.uTouchPoint.value.copy(point);
    touchTarget.current = 1;
    const amount = Math.min(0.1, 0.02 + pixelStep / 160);
    const zone = livingRuntime.apply(
      point.x,
      point.y,
      point.z,
      genital,
      amount,
      useAtlas.getState().physiologyIntensity,
    );
    if (zone !== lastHapticZone.current) {
      lastHapticZone.current = zone;
      pulseHaptic(zone);
    }
  };

  const endStroke = () => {
    gesture.current.down = false;
    livingRuntime.release();
    touchTarget.current = 0;
    lastHapticZone.current = null;
    stopHold();
  };

  useFrame((state, delta) => {
    const u = uniforms.current;
    const phys = physiologyOn ? physiologyIntensity : 0;
    livingRuntime.decay(delta);
    const { affect, arousal } = livingRuntime;
    u.uDissection.value = 0;
    u.uHasWindow.value = 0;
    u.uWindowRadius.value = 0;
    u.uHairColor.value.set(appearance.hair);
    u.uSkinTint.value.set(appearance.skinTint);
    u.uMelanin.value = appearance.melanin;
    u.uEyeColor.value.set(appearance.eyes);
    u.uSheenColor.value.set(appearance.sheen);
    u.uAttenuation.value.set(appearance.attenuation);
    u.uPhysiology.value = phys;
    u.uAffect.value = affect * (phys > 0 ? 1 : 0);
    u.uArousal.value = arousal * (phys > 0 ? 1 : 0);
    u.uSmile.value = affect * (1 - arousal * 0.42) * (phys > 0 ? 1 : 0);
    u.uBrow.value = affect * 0.7 * (phys > 0 ? 1 : 0);
    u.uLid.value = (affect * 0.18 + arousal * 0.78) * (phys > 0 ? 1 : 0);
    u.uJaw.value = arousal * 0.42 * (phys > 0 ? 1 : 0);
    const pupilTarget = THREE.MathUtils.clamp(affect * 0.2 + arousal * 0.62, 0, 1) * (phys > 0 ? 1 : 0);
    pupil.current = THREE.MathUtils.damp(pupil.current, pupilTarget, 5.2, delta);
    u.uPupil.value = pupil.current;
    u.uIris.value.set(appearance.eyes);
    u.uFaceMap.value = faceMap;
    u.uFrontMap.value = frontMap;
    u.uBackMap.value = backMap;
    u.uTouchStrength.value = THREE.MathUtils.damp(
      u.uTouchStrength.value,
      touchTarget.current,
      touchTarget.current > 0 ? 7 : 1.35,
      delta,
    );
    const breathRate = 1.28 + affect * 0.55 + arousal * 1.25;
    u.uBreathPhase.value = state.clock.elapsedTime * breathRate;
    u.uMotionAmount.value = THREE.MathUtils.damp(
      u.uMotionAmount.value,
      breathingOn && physiologyOn ? 0.8 + physiologyIntensity * 0.45 + arousal * 0.7 : 0,
      2.2,
      delta,
    );

    const orbit = controls as unknown as { target?: THREE.Vector3 } | null;
    const target = orbit?.target ?? new THREE.Vector3(0, 0.92, 0);
    const close = closeupAmount(camera.position.distanceTo(target));
    closeAmt.current = THREE.MathUtils.damp(closeAmt.current, close, 4, delta);
    u.uClose.value = closeAmt.current;
    const mat = skinMat.current;
    if (mat) {
      mat.envMapIntensity = 0.12 + closeAmt.current * 0.06;
      mat.roughness = THREE.MathUtils.clamp(
        (0.68 + appearance.melanin * 0.05) - arousal * 0.12,
        0.35,
        0.85,
      );
      mat.sheen = 0.08 + affect * 0.04 + arousal * 0.08;
      mat.sheenRoughness = THREE.MathUtils.clamp(0.68 - arousal * 0.15, 0.35, 0.75);
      mat.clearcoat = 0.04 + arousal * 0.10;
      mat.clearcoatRoughness = THREE.MathUtils.clamp(0.45 - arousal * 0.15, 0.2, 0.5);
    }

    pupil.current = THREE.MathUtils.damp(pupil.current, u.uPupil.value, 5.2, delta);

    const now = performance.now();
    if (now - lastLivingSync.current > 90) {
      lastLivingSync.current = now;
      const s = useAtlas.getState();
      if (
        Math.abs(s.affect - affect) > 0.01 ||
        Math.abs(s.arousal - arousal) > 0.01 ||
        s.touchZone !== livingRuntime.zone
      ) {
        setLiving({ affect, arousal, touchZone: livingRuntime.zone });
      }
    }
  });

  useLayoutEffect(() => {
    const found: THREE.Mesh[] = [];
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (mesh.name.startsWith("PhotorealEye")) {
        mesh.visible = true;
        mesh.material = eyeMaterial;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        mesh.raycast = () => undefined;
        eyeMaterial.clippingPlanes = planes;
        found.push(mesh);
        return;
      }
      const isSkin = mesh.name === "PhotorealMale";
      mesh.visible = isSkin;
      if (!isSkin) return;
      mesh.geometry.computeVertexNormals();
      mesh.material = material;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      material.clippingPlanes = planes;
      material.clipShadows = true;
    });
    eyes.current = found;
  }, [eyeMaterial, gltf.scene, material, planes]);

  if (!photoreal) return null;

  return (
    <primitive
      object={gltf.scene}
      onPointerDown={(event: PointerHit) => {
        (event.nativeEvent.target as Element | null)?.setPointerCapture?.(event.nativeEvent.pointerId);
        const point: [number, number, number] = [event.point.x, event.point.y, event.point.z];
        const genital = pickGenitalFromPoint(event.point.x, event.point.y, event.point.z);
        gesture.current = {
          x: event.nativeEvent.clientX,
          y: event.nativeEvent.clientY,
          lastX: event.nativeEvent.clientX,
          lastY: event.nativeEvent.clientY,
          t: performance.now(),
          point,
          genital,
          dragged: false,
          peeled: false,
          down: true,
        };
        strokeAt(event.point, genital, 8);
        stopHold();
      }}
      onPointerMove={(event: PointerHit) => {
        if (!gesture.current.down) return;
        const dx = event.nativeEvent.clientX - gesture.current.x;
        const dy = event.nativeEvent.clientY - gesture.current.y;
        const step = Math.hypot(
          event.nativeEvent.clientX - gesture.current.lastX,
          event.nativeEvent.clientY - gesture.current.lastY,
        );
        gesture.current.lastX = event.nativeEvent.clientX;
        gesture.current.lastY = event.nativeEvent.clientY;
        gesture.current.point = [event.point.x, event.point.y, event.point.z];
        const genital = pickGenitalFromPoint(event.point.x, event.point.y, event.point.z);
        gesture.current.genital = genital;
        if (dx * dx + dy * dy > 144) {
          gesture.current.dragged = true;
          if (!gesture.current.peeled) stopHold();
        }
        strokeAt(event.point, genital, step);
      }}
      onPointerUp={() => {
        if (!gesture.current.down) return;
        endStroke();
      }}
      onPointerLeave={() => {
        if (gesture.current.down) return;
        touchTarget.current = 0;
      }}
      onPointerCancel={endStroke}
    />
  );
}

useGLTF.preload(BODY_URL);
useTexture.preload(ALBEDO_URL);
useTexture.preload(FACE_URL);
useTexture.preload(FRONT_URL);
useTexture.preload(BACK_URL);
