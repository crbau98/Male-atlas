"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { TOUCH } from "three";
import { useAtlas } from "@/lib/atlas-store";
import { REGIONS } from "@/lib/regions";
import { useIsPhone } from "@/lib/use-is-phone";
import { canvasRef, captureFrameRef } from "@/lib/canvas-ref";
import { haptic } from "@/lib/haptics";
import { LIGHTING_PRESETS } from "@/lib/lighting-presets";
import { AnatomyCallouts } from "./AnatomyCallouts";
import { AnatomyLayers } from "./AnatomyLayers";
import { CameraRig } from "./CameraRig";
import { GhostShell } from "./GhostShell";
import { Hotspots } from "./Hotspots";
import { LoadBoundary } from "./LoadBoundary";
import { LocalStudio } from "./LocalStudio";
import { PhotorealGenitals } from "./PhotorealGenitals";
import { PhotorealShell } from "./PhotorealShell";
import { SectionPlanes } from "./SectionPlanes";

function Lights({ shadows, shadowSize }: { shadows: boolean; shadowSize: number }) {
  const lightingPreset = useAtlas((s) => s.lightingPreset);
  const light = LIGHTING_PRESETS[lightingPreset];
  return (
    <>
      <hemisphereLight args={light.hemisphere} />
      <directionalLight
        position={light.key.position}
        intensity={light.key.intensity}
        color={light.key.color}
        castShadow={shadows}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.00012}
        shadow-camera-near={0.4}
        shadow-camera-far={7}
        shadow-camera-left={-1.4}
        shadow-camera-right={1.4}
        shadow-camera-top={2.2}
        shadow-camera-bottom={-0.2}
      />
      <directionalLight
        position={light.fill.position}
        intensity={light.fill.intensity}
        color={light.fill.color}
      />
      <directionalLight
        position={light.rim.position}
        intensity={light.rim.intensity}
        color={light.rim.color}
      />
    </>
  );
}

function ContextLossOverlay({ onReload }: { onReload: () => void }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 grid place-items-center bg-[#07080c]/95">
      <div className="w-[min(20rem,84vw)] rounded-2xl border border-white/10 bg-[#101218]/95 p-5 text-center backdrop-blur-md">
        <p className="text-[10px] tracking-[0.28em] text-[#c4a46c] uppercase">Male Atlas</p>
        <p className="mt-2 font-serif text-xl text-[#efece6]">Graphics ran low on memory</p>
        <p className="mt-2 text-[12px] leading-5 text-[#9a958c]">
          The phone paused 3D rendering to free up memory. Tap below to pick back up right where you were.
        </p>
        <button
          type="button"
          onClick={onReload}
          className="mt-4 min-h-11 w-full rounded-full bg-[#c4a46c] px-4 text-sm font-medium text-[#16140f]"
        >
          Reload the body
        </button>
      </div>
    </div>
  );
}

export function AtlasCanvas() {
  const phone = useIsPhone();
  const cameraGoal = useAtlas((s) => s.cameraGoal);
  const selectedId = useAtlas((s) => s.selectedId);
  const dissection = useAtlas((s) => s.dissection);
  const theme = useAtlas((s) => s.theme);
  const lightingPreset = useAtlas((s) => s.lightingPreset);
  const qualityMode = useAtlas((s) => s.qualityMode);
  const start = REGIONS.full;
  const paper = dissection > 0.16;
  const [contextLost, setContextLost] = useState(false);
  const [adaptiveDpr, setAdaptiveDpr] = useState(1.25);
  const lastMissedTap = useRef(0);
  const resetView = useAtlas((s) => s.resetView);

  const handleMissed = useCallback(() => {
    const now = performance.now();
    if (now - lastMissedTap.current < 380) {
      haptic([12, 30, 12]);
      resetView();
      lastMissedTap.current = 0;
      return;
    }
    lastMissedTap.current = now;
    useAtlas.getState().select(null);
  }, [resetView]);

  const handleCreated = useCallback((state: {
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  }) => {
    const canvas = state.gl.domElement;
    canvasRef.current = canvas;
    captureFrameRef.current = () => {
      state.gl.render(state.scene, state.camera);
      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    };
    canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        setContextLost(true);
      },
      false,
    );
    canvas.addEventListener("webglcontextrestored", () => setContextLost(false), false);

    if (canvas.dataset.atlasGestures !== "ready") {
      canvas.dataset.atlasGestures = "ready";
      canvas.addEventListener(
        "touchstart",
        (event) => {
          if (event.touches.length !== 3) return;
          event.preventDefault();
          const atlas = useAtlas.getState();
          haptic([9, 24, 9]);
          const nextDepth = Math.min(1, atlas.dissection + 0.16);
          atlas.setDissection(nextDepth);
          if (!atlas.peelCenter) {
            const fallback = REGIONS[atlas.region].peel ?? ([0, 1.22, 0.14] as [number, number, number]);
            atlas.setPeel(fallback, 0.16);
          }
        },
        { passive: false },
      );
    }
  }, []);

  const preset = LIGHTING_PRESETS[lightingPreset];
  const qualityCap =
    qualityMode === "high" ? (phone ? 1.75 : 2) : qualityMode === "balanced" ? 1.15 : phone ? 1.5 : 1.75;
  const dpr = Math.min(adaptiveDpr, qualityCap);
  const shadows = !phone || qualityMode === "high";
  const shadowSize = phone ? 512 : qualityMode === "high" ? 1536 : 1024;
  const sceneBackground = paper
    ? preset.background.light
    : theme === "light"
      ? preset.background.light
      : preset.background.dark;
  const groundColor = paper
    ? preset.ground.light
    : theme === "light"
      ? preset.ground.light
      : preset.ground.dark;

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows={shadows}
        dpr={dpr}
        gl={{
          antialias: true,
          localClippingEnabled: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          toneMapping: THREE.NoToneMapping,
          toneMappingExposure: preset.exposure,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{
          position: start.eye,
          fov: phone ? 36 : 30,
          near: 0.04,
          far: 16,
        }}
        style={{ touchAction: "none" }}
        onPointerMissed={handleMissed}
        onCreated={handleCreated}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setAdaptiveDpr(1)}
          onIncline={() => setAdaptiveDpr(phone ? 1.25 : 1.5)}
        />
        <color attach="background" args={[sceneBackground]} />
        <Lights shadows={shadows} shadowSize={shadowSize} />
        <LocalStudio />
        <Suspense fallback={null}>
          <LoadBoundary>
            <PhotorealShell />
          </LoadBoundary>
          <LoadBoundary>
            <GhostShell />
          </LoadBoundary>
          <LoadBoundary>
            <PhotorealGenitals />
          </LoadBoundary>
          <LoadBoundary>
            <AnatomyLayers />
          </LoadBoundary>
          <Hotspots />
          <AnatomyCallouts />
          <SectionPlanes />
        </Suspense>
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.38}
          scale={3}
          blur={2.8}
          far={2.2}
          resolution={phone ? 256 : 512}
          frames={1}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <circleGeometry args={[3.2, phone ? 48 : 96]} />
          <meshStandardMaterial color={groundColor} roughness={0.92} metalness={0} />
        </mesh>
        <CameraRig />
        <OrbitControls
          makeDefault
          enablePan
          enableDamping
          dampingFactor={0.072}
          autoRotate={false}
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
      {contextLost ? <ContextLossOverlay onReload={() => window.location.reload()} /> : null}
    </div>
  );
}
