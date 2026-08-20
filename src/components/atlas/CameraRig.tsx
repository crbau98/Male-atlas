"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useAtlas } from "@/lib/atlas-store";

const DURATION = 0.85;
const startEye = new THREE.Vector3();
const startTarget = new THREE.Vector3();
const endEye = new THREE.Vector3();
const endTarget = new THREE.Vector3();

export function CameraRig() {
  const goal = useAtlas((s) => s.cameraGoal);
  const clearCameraGoal = useAtlas((s) => s.clearCameraGoal);
  const { camera, controls } = useThree();
  const t = useRef(1);

  useEffect(() => {
    if (!goal || !controls) return;
    const orbit = controls as unknown as { target: THREE.Vector3 };
    startEye.copy(camera.position);
    startTarget.copy(orbit.target);
    endTarget.set(...goal.target);
    if (goal.eye) {
      endEye.set(...goal.eye);
    } else {
      const dist = goal.distance ?? camera.position.distanceTo(orbit.target);
      const dir = camera.position.clone().sub(orbit.target);
      if (dir.lengthSq() < 1e-6) dir.set(0.25, 0.12, 0.5);
      dir.normalize().multiplyScalar(Math.max(0.22, Math.min(dist, 1.15)));
      endEye.copy(endTarget).add(dir);
    }
    t.current = 0;
  }, [camera, controls, goal]);

  useFrame((_, delta) => {
    if (!goal || !controls || t.current >= 1) return;
    const orbit = controls as unknown as { target: THREE.Vector3; update: () => void };
    t.current = Math.min(1, t.current + delta / DURATION);
    // Smooth quintic ease in-out
    const p = t.current;
    const e = p < 0.5 ? 16 * p * p * p * p * p : 1 - Math.pow(-2 * p + 2, 5) / 2;
    camera.position.lerpVectors(startEye, endEye, e);
    orbit.target.lerpVectors(startTarget, endTarget, e);
    orbit.update();
    if (t.current >= 1) clearCameraGoal();
  });
  return null;
}
