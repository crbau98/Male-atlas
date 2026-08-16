"use client";

import { Html } from "@react-three/drei";
import { useAtlas } from "@/lib/atlas-store";
import { HOTSPOTS } from "@/lib/regions";

export function Hotspots() {
  const dissection = useAtlas((s) => s.dissection);
  const isolated = useAtlas((s) => s.isolated);
  const goRegion = useAtlas((s) => s.goRegion);
  if (isolated || dissection > 0.48) return null;

  return (
    <group>
      {HOTSPOTS.map((spot) => (
        <group key={spot.region} position={spot.position}>
          <mesh
            onClick={(event) => {
              event.stopPropagation();
              goRegion(spot.region);
            }}
          >
            <sphereGeometry args={[0.032, 18, 18]} />
            <meshBasicMaterial color="#c4a46c" depthTest={false} transparent opacity={0.92} />
          </mesh>
          <Html center style={{ pointerEvents: "none" }}>
            <div className="rounded-full border border-[#c4a46c]/50 bg-[#101218]/85 px-2 py-0.5 text-[10px] tracking-[0.16em] text-[#c4a46c] uppercase whitespace-nowrap">
              {spot.label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
