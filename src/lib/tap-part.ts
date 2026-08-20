"use client";

import { useAtlas } from "@/lib/atlas-store";
import type { Vec3 } from "@/lib/regions";
import { haptic } from "@/lib/haptics";

const lastTap = { id: "", t: 0 };

export function tapPart(id: string, point: Vec3) {
  const now = performance.now();
  const atlas = useAtlas.getState();
  const doubled = lastTap.id === id && now - lastTap.t < 380;
  lastTap.id = id;
  lastTap.t = now;
  atlas.select(id, point);
  if (atlas.photoreal) {
    atlas.setPeel(point, Math.max(atlas.peelRadius, 0.13));
    if (atlas.dissection < 0.14) atlas.setDissection(0.22);
  }
  if (doubled) {
    haptic([14, 40, 14]);
    if (!useAtlas.getState().isolated) atlas.toggleIsolate();
    useAtlas.setState({ cameraGoal: { target: point, distance: 0.3 } });
    return;
  }
  haptic(12);
  atlas.lookAt(point);
}
