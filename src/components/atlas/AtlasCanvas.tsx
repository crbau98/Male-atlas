"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TOUCH } from "three";
import { useAtlas } from "@/lib/atlas-store";
import { REGIONS } from "@/lib/regions";
import { useIsPhone } from "@/lib/use-is-phone";
import { AnatomyLayers } from "./AnatomyLayers";
import { CameraRig } from "./CameraRig";
import { Hotspots } from "./Hotspots";
import { LoadBoundary } from "./LoadBoundary";
import { LocalStudio } from "./LocalStudio";
import { PhotorealGenitals } from "./PhotorealGenitals";
import { PhotorealShell } from "./PhotorealShell";

function Lights() {
  return (
    <>
      <hemisphereLight args={["#f7f1ea", "#1a1612", 0.62]} />
      <directionalLight
        position={[2.6, 4.4, 2.4]}
        intensity={1.35}
        color="#fff6ea"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00012}
        shadow-camera-near={0.4}
        shadow-camera-far={7}
        shadow-camera-left={-1.4}
        shadow-camera-right={1.4}
        shadow-camera-top={2.2}
        shadow-camera-bottom={-0.2}
      />
      <directionalLight position={[-2.8, 1.6, -1.8]} intensity={0.48} color="#9eb4d4" />
      <spotLight
        position={[0.35, 3.5, 1.35]}
        angle={0.48}
        penumbra={0.9}
        intensity={0.7}
        color="#ffe6d0"
      />
      <pointLight position={[0, 1.1, 1.6]} intensity={0.28} color="#ffd8c0" distance={4} />
    </>
  );
}

export function AtlasCanvas() {
  const phone = useIsPhone();
  const cameraGoal = useAtlas((s) => s.cameraGoal);
  const selectedId = useAtlas((s) => s.selectedId);
  const start = REGIONS.full;

  return (
    <Canvas
      shadows
      dpr={phone ? [1.5, 2] : [1.75, 2]}
      gl={{
        antialias: true,
        localClippingEnabled: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{
        position: start.eye,
        fov: phone ? 36 : 30,
        near: 0.04,
        far: 16,
      }}
      style={{ touchAction: "none" }}
      onPointerMissed={() => useAtlas.getState().select(null)}
    >
      <color attach="background" args={["#0c0e14"]} />
      <Lights />
      <LocalStudio />
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
        opacity={0.38}
        scale={3}
        blur={2.8}
        far={2.2}
        resolution={1024}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <circleGeometry args={[3.2, 96]} />
        <meshStandardMaterial color="#12141c" roughness={0.92} metalness={0} />
      </mesh>
      <CameraRig />
      <OrbitControls
        makeDefault
        enablePan
        enableDamping
        dampingFactor={0.072}
        autoRotate={!cameraGoal && !selectedId}
        autoRotateSpeed={0.22}
        minDistance={0.14}
        maxDistance={4.6}
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
