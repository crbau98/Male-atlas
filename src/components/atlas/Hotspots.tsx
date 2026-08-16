"use client";

import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { useAtlas } from "@/lib/atlas-store";
import { HOTSPOTS } from "@/lib/regions";

function Marker({
  position,
  label,
  onPick,
  delay,
}: {
  position: [number, number, number];
  label: string;
  onPick: () => void;
  delay: number;
}) {
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + delay;
    const s = 1 + Math.sin(t * 2.4) * 0.1;
    core.current?.scale.setScalar(s);
    if (ring.current) {
      const pulse = 1.15 + (Math.sin(t * 2.4) * 0.5 + 0.5) * 0.85;
      ring.current.scale.setScalar(pulse);
      const mat = ring.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.42 * (1.15 - (pulse - 1.15) / 0.85);
    }
  });
  return (
    <group position={position}>
      <mesh ref={ring} renderOrder={8}>
        <ringGeometry args={[0.018, 0.026, 32]} />
        <meshBasicMaterial color="#c4a46c" transparent opacity={0.35} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        ref={core}
        renderOrder={9}
        onClick={(event) => {
          event.stopPropagation();
          onPick();
        }}
      >
        <sphereGeometry args={[0.022, 28, 28]} />
        <meshPhysicalMaterial
          color="#c4a46c"
          emissive="#c4a46c"
          emissiveIntensity={0.7}
          roughness={0.22}
          transparent
          opacity={0.95}
          depthTest={false}
        />
      </mesh>
      <Html center style={{ pointerEvents: "none" }}>
        <div className="rounded-full border border-[#c4a46c]/50 bg-[#101218]/85 px-2 py-0.5 text-[10px] tracking-[0.16em] text-[#c4a46c] uppercase whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  );
}

export function Hotspots() {
  const dissection = useAtlas((s) => s.dissection);
  const isolated = useAtlas((s) => s.isolated);
  const goRegion = useAtlas((s) => s.goRegion);
  if (isolated || dissection > 0.48) return null;

  return (
    <group>
      {HOTSPOTS.map((spot, i) => (
        <Marker
          key={spot.region}
          position={spot.position}
          label={spot.label}
          delay={i * 0.35}
          onPick={() => goRegion(spot.region)}
        />
      ))}
    </group>
  );
}
