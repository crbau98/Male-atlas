"use client";

import { useMemo } from "react";
import { Environment } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function LocalStudio() {
  const gl = useThree((s) => s.gl);
  const texture = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new RoomEnvironment();
    const rt = pmrem.fromScene(env, 0.03);
    env.dispose();
    pmrem.dispose();
    return rt.texture;
  }, [gl]);

  return <Environment map={texture} environmentIntensity={0.9} />;
}
