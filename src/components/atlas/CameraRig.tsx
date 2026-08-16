"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useAtlas } from "@/lib/atlas-store";

const DURATION = 1.08;
const startEye = new THREE.Vector3();
const startTarget = new THREE.Vector3();
const endEye = new THREE.Vector3();
const endTarget = new THREE.Vector3();
const side = new THREE.Vector3();
const chord = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);

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
    const e = t.current * t.current * (3 - 2 * t.current);
    chord.copy(endEye).sub(startEye);
    side.copy(chord).cross(up);
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    side.normalize().multiplyScalar(Math.sin(Math.PI * e) * chord.length() * 0.14);
    camera.position.lerpVectors(startEye, endEye, e).add(side);
    orbit.target.lerpVectors(startTarget, endTarget, e);
    orbit.update();
    if (t.current >= 1) clearCameraGoal();
  });
  return null;
}
