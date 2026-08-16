"use client";

import { useAtlas } from "@/lib/atlas-store";
import type { Vec3 } from "@/lib/regions";

const lastTap = { id: "", t: 0 };

export function tapPart(id: string, point: Vec3) {
  const now = performance.now();
  const atlas = useAtlas.getState();
  const doubled = lastTap.id === id && now - lastTap.t < 380;
  lastTap.id = id;
  lastTap.t = now;
  atlas.select(id, point);
  if (doubled) {
    if (!useAtlas.getState().isolated) atlas.toggleIsolate();
    useAtlas.setState({ cameraGoal: { target: point, distance: 0.3 } });
    return;
  }
  atlas.lookAt(point);
}
