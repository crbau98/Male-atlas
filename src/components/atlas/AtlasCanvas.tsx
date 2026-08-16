"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { TOUCH } from "three";
import { useAtlas } from "@/lib/atlas-store";
import { REGIONS } from "@/lib/regions";
import { useIsPhone } from "@/lib/use-is-phone";
import { AnatomyLayers } from "./AnatomyLayers";
import { CameraRig } from "./CameraRig";
import { Hotspots } from "./Hotspots";
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
  const phone = useIsPhone();
  const start = REGIONS.full;

  return (
    <Canvas
      dpr={phone ? [1, 1.15] : [1, 1.6]}
      gl={{
        antialias: !phone,
        localClippingEnabled: true,
        powerPreference: "high-performance",
      }}
      camera={{
        position: start.eye,
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
        <Hotspots />
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
      <CameraRig />
      <OrbitControls
        makeDefault
        enablePan
        enableDamping
        dampingFactor={phone ? 0.12 : 0.08}
        minDistance={0.18}
        maxDistance={5}
        maxPolarAngle={Math.PI * 0.94}
        target={start.target}
        touches={{
          ONE: TOUCH.ROTATE,
          TWO: TOUCH.DOLLY_PAN,
        }}
      />
    </Canvas>
  );
}
