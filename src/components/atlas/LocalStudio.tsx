"use client";

import { useEffect, useMemo } from "react";
import { Environment } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useAtlas } from "@/lib/atlas-store";
import { LIGHTING_PRESETS } from "@/lib/lighting-presets";

export function LocalStudio() {
  const gl = useThree((s) => s.gl);
  const lightingPreset = useAtlas((s) => s.lightingPreset);
  const target = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new RoomEnvironment();
    const rt = pmrem.fromScene(env, 0.03);
    env.dispose();
    pmrem.dispose();
    return rt;
  }, [gl]);

  useEffect(() => () => target.dispose(), [target]);

  return (
    <Environment
      map={target.texture}
      environmentIntensity={LIGHTING_PRESETS[lightingPreset].environmentIntensity}
    />
  );
}
