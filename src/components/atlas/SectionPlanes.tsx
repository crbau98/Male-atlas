"use client";

import * as THREE from "three";
import { useAtlas } from "@/lib/atlas-store";

function CutPlane({
  position,
  rotation,
  size,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} renderOrder={4} raycast={() => undefined}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        color="#8a1f1a"
        transparent
        opacity={0.11}
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function SectionPlanes() {
  const clipMode = useAtlas((s) => s.clipMode);
  const clipEnabled = useAtlas((s) => s.clipEnabled);
  const clipY = useAtlas((s) => s.clipY);
  if (!clipEnabled || clipMode === "off") return null;
  const sagittal = clipMode === "sagittal" || clipMode === "quarter" || clipMode === "hemi";
  const coronal = clipMode === "coronal" || clipMode === "hemi";
  const axial = clipMode === "axial" || clipMode === "quarter";
  return (
    <group>
      {sagittal ? <CutPlane position={[0.008, 0.92, 0]} rotation={[0, Math.PI / 2, 0]} size={[1.15, 1.95]} /> : null}
      {coronal ? <CutPlane position={[0, 0.92, 0.05]} rotation={[0, 0, 0]} size={[0.72, 1.95]} /> : null}
      {axial ? <CutPlane position={[0, clipY, 0]} rotation={[-Math.PI / 2, 0, 0]} size={[0.85, 0.7]} /> : null}
    </group>
  );
}
