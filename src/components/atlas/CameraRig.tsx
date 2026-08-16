"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useAtlas } from "@/lib/atlas-store";

export function CameraRig() {
  const goal = useAtlas((s) => s.cameraGoal);
  const clearCameraGoal = useAtlas((s) => s.clearCameraGoal);
  const { camera, controls } = useThree();
  const eye = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!goal || !controls) return;
    const orbit = controls as unknown as { target: THREE.Vector3; update: () => void };
    eye.current.set(...goal.eye);
    target.current.set(...goal.target);
    const k = 1 - Math.exp(-5.2 * delta);
    camera.position.lerp(eye.current, k);
    orbit.target.lerp(target.current, k);
    orbit.update();
    if (
      camera.position.distanceTo(eye.current) < 0.025 &&
      orbit.target.distanceTo(target.current) < 0.025
    ) {
      clearCameraGoal();
    }
  });
  return null;
}
