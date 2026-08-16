"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { useAtlas } from "@/lib/atlas-store";
import { AnatomyLayers } from "./AnatomyLayers";
import { LoadBoundary } from "./LoadBoundary";
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

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        localClippingEnabled: true,
        powerPreference: "high-performance",
      }}
      camera={{
        position: brainFocus ? [0.18, 1.58, 0.58] : [0, 0.95, 2.35],
        fov: 35,
        near: 0.05,
        far: 20,
      }}
      onPointerMissed={() => useAtlas.getState().select(null)}
    >
      <color attach="background" args={["#0b0d12"]} />
      <fog attach="fog" args={["#0b0d12", 4.5, 9]} />
      <Lights />
      <Environment preset="studio" />
      <Suspense fallback={null}>
        <LoadBoundary>
          <PhotorealShell />
        </LoadBoundary>
        <LoadBoundary>
          <AnatomyLayers />
        </LoadBoundary>
      </Suspense>
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.45}
        scale={3}
        blur={2.2}
        far={1.8}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <circleGeometry args={[3.2, 64]} />
        <meshStandardMaterial color="#12141b" roughness={0.9} />
      </mesh>
      <OrbitControls
        makeDefault
        enablePan
        minDistance={0.25}
        maxDistance={5}
        maxPolarAngle={Math.PI * 0.92}
        target={brainFocus ? [0, 1.54, 0] : [0, 0.92, 0]}
      />
    </Canvas>
  );
}
