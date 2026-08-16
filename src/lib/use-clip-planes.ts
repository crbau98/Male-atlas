"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useAtlas } from "@/lib/atlas-store";
import { clipPlaneArgs } from "@/lib/clip";

export function useClipPlanes() {
  const clipMode = useAtlas((s) => s.clipMode);
  const clipY = useAtlas((s) => s.clipY);
  const clipEnabled = useAtlas((s) => s.clipEnabled);
  return useMemo(() => {
    const mode = clipEnabled && clipMode === "off" ? "axial" : clipMode;
    const args = clipPlaneArgs(mode, clipY);
    if (!args) return [];
    return [new THREE.Plane(new THREE.Vector3(...args.normal), args.constant)];
  }, [clipEnabled, clipMode, clipY]);
}
