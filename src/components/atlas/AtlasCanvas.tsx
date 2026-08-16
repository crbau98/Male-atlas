"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { TOUCH } from "three";
import { useAtlas } from "@/lib/atlas-store";
import { useIsPhone } from "@/lib/use-is-phone";
import { AnatomyLayers } from "./AnatomyLayers";
import { LoadBoundary } from "./LoadBoundary";
import { PhotorealGenitals } from "./PhotorealGenitals";
import { PhotorealShell } from "./PhotorealShell";

function Lights() {
  return (
    <>
      <hemisphereLight args={["#f2ebe3", "#1a1814", 0.7]} />
      <directionalLight position={[2.5, 4.2, 2.2]} intensity={1.6} color="#fff4e8" />
      <directionalLight position={[-3, 1.4, -2]} intensity={0.45} color="#8ea4c8" />
      <spotLight
        position={[0.4, 3.4, 1.2]}
        angle={0.5}
        penumbra={0.7}
        intensity={1.1}
        color="#ffe8d2"
      />
    </>
  );
}

export function AtlasCanvas() {
  const brainFocus = useAtlas((s) => s.brainFocus);
  const pelvisFocus = useAtlas((s) => s.pelvisFocus);
  const phone = useIsPhone();
  const camera = pelvisFocus
    ? { position: [0.22, 0.92, 0.62] as [number, number, number], target: [0, 0.8, 0.12] as [number, number, number] }
    : brainFocus
      ? { position: [0.18, 1.58, 0.58] as [number, number, number], target: [0, 1.54, 0] as [number, number, number] }
      : { position: [0, 0.95, phone ? 2.7 : 2.35] as [number, number, number], target: [0, 0.92, 0] as [number, number, number] };

  return (
    <Canvas
      dpr={phone ? [1, 1.15] : [1, 1.6]}
      gl={{
        antialias: !phone,
        localClippingEnabled: true,
        powerPreference: "high-performance",
      }}
      camera={{
        position: camera.position,
        fov: phone ? 40 : 35,
        near: 0.05,
        far: 20,
      }}
      style={{ touchAction: "none" }}
      onPointerMissed={() => useAtlas.getState().select(null)}
    >
      <color attach="background" args={["#0b0d12"]} />
      <fog attach="fog" args={["#0b0d12", 4.5, 9]} />
      <Lights />
      {phone ? null : <Environment preset="studio" />}
      <Suspense fallback={null}>
        <LoadBoundary>
          <PhotorealShell />
        </LoadBoundary>
        <LoadBoundary>
          <PhotorealGenitals />
        </LoadBoundary>
        <LoadBoundary>
          <AnatomyLayers />
        </LoadBoundary>
      </Suspense>
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={phone ? 0.28 : 0.45}
        scale={3}
        blur={phone ? 1.4 : 2.2}
        far={1.8}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <circleGeometry args={[3.2, 64]} />
        <meshStandardMaterial color="#12141b" roughness={0.9} />
      </mesh>
      <OrbitControls
        makeDefault
        enablePan
        enableDamping
        dampingFactor={phone ? 0.12 : 0.08}
        minDistance={0.18}
        maxDistance={5}
        maxPolarAngle={Math.PI * 0.94}
        target={camera.target}
        touches={{
          ONE: TOUCH.ROTATE,
          TWO: TOUCH.DOLLY_PAN,
        }}
      />
    </Canvas>
  );
}
