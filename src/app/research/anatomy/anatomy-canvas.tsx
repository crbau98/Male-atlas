"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { Html, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  CYCLE_SECONDS,
  MODEL_DEPTH_OFFSET,
  SKINS,
  STRUCTURES,
  VIEWS,
  breathExcursion,
  type CameraView,
  type Point,
  type StudyMode,
} from "./anatomy-data";

type Props = {
  mode: StudyMode;
  skin: number;
  selected: string;
  onSelect: (id: string) => void;
  opacity: number;
  labels: boolean;
  view: CameraView;
  cameraRevision: number;
  playing: boolean;
  time: number;
  clockRef: MutableRefObject<number>;
  onTime: (time: number) => void;
  breaths: number;
  pulse: number;
  onContextLost: () => void;
};
const partMap = new Map(STRUCTURES.map((s) => [s.id, s]));
const labelStyle = {
  whiteSpace: "nowrap",
  background: "#152b25e8",
  border: "1px solid #648f79",
  padding: "5px 8px",
  borderRadius: 4,
  color: "#d4e3d8",
  fontSize: 10,
  pointerEvents: "none",
} as const;

function Label({ position, children }: { position: Point; children: string }) {
  return (
    <Html position={position} center style={{ pointerEvents: "none" }}>
      <span style={labelStyle}>{children}</span>
    </Html>
  );
}
function CameraRig({ view, revision }: { view: CameraView; revision: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate } = useThree();
  useLayoutEffect(() => {
    const preset = VIEWS.find((v) => v.id === view)!;
    camera.position.set(...preset.position);
    camera.lookAt(...preset.target);
    controls.current?.target.set(...preset.target);
    controls.current?.update();
    invalidate();
  }, [camera, invalidate, revision, view]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      minDistance={0.23}
      maxDistance={4}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI - 0.1}
    />
  );
}
function SceneClock({
  playing,
  time,
  clockRef,
  onTime,
}: Pick<Props, "playing" | "time" | "clockRef" | "onTime">) {
  const last = useRef(-1);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, delta) => {
    if (!playing) return;
    clockRef.current = Math.min(
      CYCLE_SECONDS,
      clockRef.current + Math.min(delta, 0.1),
    );
    const tick = Math.floor(clockRef.current * 10);
    if (tick !== last.current) {
      last.current = tick;
      onTime(clockRef.current);
    }
    if (clockRef.current < CYCLE_SECONDS) invalidate();
  });
  useEffect(() => {
    if (playing) {
      last.current = -1;
      invalidate();
    }
  }, [playing, invalidate]);
  useEffect(() => {
    invalidate();
  }, [time, invalidate]);
  return null;
}
function RefreshScene({ revision }: { revision: string }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate, revision]);
  return null;
}
function ContextEvents({ onLost }: { onLost: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onLost]);
  return null;
}

function AdultSurface({
  skin,
  mode,
  opacity,
  clockRef,
  breaths,
}: Pick<Props, "skin" | "mode" | "opacity" | "clockRef" | "breaths">) {
  const { scene } = useGLTF("/models/photoreal-male.glb");
  const breathingUniformRef = useRef<{ value: number } | null>(null);
  const texture = useTexture("/skins/skin-normal.png");
  const prepared = useMemo(() => {
    // Own only materials and texture clone. Cached source geometry is never mutated.
    const map = texture.clone();
    map.flipY = false;
    map.colorSpace = THREE.NoColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);
    const excursion = { value: 0 };
    const material = new THREE.MeshPhysicalMaterial({
      normalMap: map,
      normalScale: new THREE.Vector2(0.12, 0.12),
      roughness: 0.68,
      metalness: 0,
      sheen: 0.15,
      sheenColor: new THREE.Color("#efb9a0"),
      specularIntensity: 0.22,
    });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.studyBreath = excursion;
      shader.vertexShader = `uniform float studyBreath;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float chest = smoothstep(0.94, 1.14, transformed.y) * (1.0 - smoothstep(1.35, 1.47, transformed.y));
        float central = 1.0 - smoothstep(0.14, 0.25, abs(transformed.x));
        transformed.z += studyBreath * chest * central * 0.006;
        transformed.x += studyBreath * chest * central * transformed.x * 0.025;
      `,
      );
    };
    material.customProgramCacheKey = () => "clinical-breath-v1";
    const eyes = new THREE.MeshPhysicalMaterial({
      color: "#d1c7b9",
      roughness: 0.28,
    });
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material = obj.name === "PhotorealMale" ? material : eyes;
      }
    });
    return { clone, material, eyes, map, excursion };
  }, [scene, texture]);
  useLayoutEffect(() => {
    const { material, eyes } = prepared;
    breathingUniformRef.current = prepared.excursion;
    material.color.set(SKINS[skin].color);
    for (const mat of [material, eyes]) {
      mat.transparent = mode !== "surface";
      mat.opacity = mode === "surface" ? 1 : opacity;
      mat.depthWrite = mode === "surface";
      mat.needsUpdate = true;
    }
  }, [mode, opacity, prepared, skin]);
  useFrame(() => {
    if (breathingUniformRef.current)
      breathingUniformRef.current.value =
        mode === "breathing" ? breathExcursion(clockRef.current, breaths) : 0;
  });
  useEffect(
    () => () => {
      prepared.material.dispose();
      prepared.eyes.dispose();
      prepared.map.dispose();
    },
    [prepared],
  );
  return (
    <group>
      <primitive object={prepared.clone} dispose={null} />
      {mode === "surface"
        ? [-0.0333, 0.0336].map((x) => (
            <group key={x}>
              <mesh position={[x, 1.607, 0.101]} scale={[1, 1, 0.45]}>
                <sphereGeometry args={[0.0046, 20, 16]} />
                <meshStandardMaterial color="#655846" roughness={0.3} />
              </mesh>
              <mesh position={[x, 1.607, 0.103]} scale={[1, 1, 0.25]}>
                <sphereGeometry args={[0.0021, 16, 12]} />
                <meshStandardMaterial color="#181816" roughness={0.18} />
              </mesh>
            </group>
          ))
        : null}
    </group>
  );
}

// Static external envelope for the educational surface view. The body base asset
// has only a simplified groin; this envelope is approximate, not a scan.
function ExternalAnatomy({ skin }: Pick<Props, "skin">) {
  const prepared = useMemo(() => {
    const shaftPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.847, 0.081),
      new THREE.Vector3(0, 0.83, 0.104),
      new THREE.Vector3(0, 0.811, 0.118),
      new THREE.Vector3(0, 0.8, 0.122),
    ]);
    const shaft = new THREE.TubeGeometry(shaftPath, 36, 0.0125, 32, false);
    const scrotum = new THREE.SphereGeometry(1, 40, 32);
    const positions = scrotum.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i),
        y = positions.getY(i),
        z = positions.getZ(i);
      positions.setXYZ(i, x * 0.029, y * 0.031 + x * 0.0025, z * 0.021);
    }
    scrotum.computeVertexNormals();
    return { shaft, scrotum };
  }, []);
  useEffect(
    () => () => {
      prepared.shaft.dispose();
      prepared.scrotum.dispose();
    },
    [prepared],
  );
  return (
    <group>
      <mesh geometry={prepared.shaft}>
        <meshPhysicalMaterial
          color={SKINS[skin].color}
          roughness={0.72}
          specularIntensity={0.2}
        />
      </mesh>
      <mesh geometry={prepared.scrotum} position={[0, 0.781, 0.082]}>
        <meshPhysicalMaterial
          color={SKINS[skin].color}
          roughness={0.8}
          specularIntensity={0.16}
        />
      </mesh>
      <mesh
        position={[0, 0.797, 0.123]}
        rotation={[0.35, 0, 0]}
        scale={[0.014, 0.016, 0.013]}
      >
        <sphereGeometry args={[1, 36, 28]} />
        <meshPhysicalMaterial
          color={SKINS[skin].color}
          roughness={0.64}
          specularIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

function TissueLayer({
  selected,
  onSelect,
  labels,
}: Pick<Props, "selected" | "onSelect" | "labels">) {
  const { scene } = useGLTF("/models/systems/reproductive.glb");
  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    const meshes: THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshStandardMaterial
    >[] = [];
    const centers = new Map<string, THREE.Vector3>();
    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const part = partMap.get(obj.name);
      obj.visible = Boolean(part);
      if (!part) return;
      obj.material = new THREE.MeshStandardMaterial({
        color: part.color,
        roughness: 0.62,
        side: THREE.DoubleSide,
      });
      meshes.push(
        obj as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>,
      );
      centers.set(
        obj.name,
        new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3()),
      );
    });
    return { clone, meshes, centers };
  }, [scene]);
  useLayoutEffect(() => {
    for (const mesh of prepared.meshes) {
      mesh.material.emissive.set(
        mesh.name === selected ? "#638d76" : "#000000",
      );
      mesh.material.setValues({
        emissiveIntensity: mesh.name === selected ? 0.42 : 0,
      });
    }
  }, [prepared, selected]);
  useEffect(
    () => () => {
      prepared.meshes.forEach((mesh) => mesh.material.dispose());
    },
    [prepared],
  );
  const center = prepared.centers.get(selected);
  const part = partMap.get(selected)!;
  function select(event: ThreeEvent<MouseEvent>) {
    if (event.delta > 4 || !partMap.has(event.object.name)) return;
    event.stopPropagation();
    onSelect(event.object.name);
  }
  return (
    <group position={[0, 0, MODEL_DEPTH_OFFSET]}>
      <primitive object={prepared.clone} dispose={null} onClick={select} />
      {labels && center ? (
        <Label position={[center.x + 0.11, center.y + 0.035, center.z]}>
          {part.name}
        </Label>
      ) : null}
    </group>
  );
}
function RespiratoryLayer({
  clockRef,
  breaths,
  labels,
}: Pick<Props, "clockRef" | "breaths" | "labels">) {
  const { scene } = useGLTF("/models/systems/respiratory.glb");
  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    const airways = new THREE.MeshStandardMaterial({
      color: "#9fc7bc",
      roughness: 0.65,
    });
    const diaphragmMaterial = new THREE.MeshStandardMaterial({
      color: "#c59180",
      roughness: 0.72,
      side: THREE.DoubleSide,
    });
    let diaphragm: THREE.Mesh | undefined;
    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.material = obj.name === "FJ3131" ? diaphragmMaterial : airways;
      if (obj.name === "FJ3131") diaphragm = obj;
    });
    return {
      clone,
      airways,
      diaphragmMaterial,
      diaphragm,
      originalY: diaphragm?.position.y ?? 0,
    };
  }, [scene]);
  useFrame(() => {
    if (prepared.diaphragm)
      prepared.diaphragm.position.setY(
        prepared.originalY - breathExcursion(clockRef.current, breaths) * 0.012,
      );
  });
  useEffect(
    () => () => {
      prepared.airways.dispose();
      prepared.diaphragmMaterial.dispose();
    },
    [prepared],
  );
  return (
    <group position={[0, 0, MODEL_DEPTH_OFFSET]}>
      <primitive object={prepared.clone} dispose={null} />
      {labels ? (
        <>
          <Label position={[-0.15, 1.33, 0.12]}>Segmented airways</Label>
          <Label position={[0.13, 1.09, 0.13]}>Diaphragm</Label>
        </>
      ) : null}
    </group>
  );
}
// Conceptual closed systemic circuit; deliberately not presented as actual vessel segmentation.
const FLOW_PATH: Point[] = [
  [0.04, 1.26, 0.06],
  [0.075, 1.14, 0.07],
  [0.07, 0.94, 0.09],
  [0.12, 0.66, 0.09],
  [0.1, 0.32, 0.08],
  [0.065, 0.2, 0.08],
  [0.03, 0.39, 0.08],
  [0.045, 0.68, 0.08],
  [0.01, 0.94, 0.09],
  [-0.025, 1.14, 0.08],
  [0.04, 1.26, 0.06],
];
function CirculationLayer({
  clockRef,
  pulse,
  labels,
}: Pick<Props, "clockRef" | "pulse" | "labels">) {
  const prepared = useMemo(() => {
    const outward = new THREE.CatmullRomCurve3(
      FLOW_PATH.slice(0, 6).map((p) => new THREE.Vector3(...p)),
    );
    const inward = new THREE.CatmullRomCurve3(
      FLOW_PATH.slice(5).map((p) => new THREE.Vector3(...p)),
    );
    return {
      outward,
      inward,
      artery: new THREE.TubeGeometry(outward, 80, 0.003, 8, false),
      vein: new THREE.TubeGeometry(inward, 80, 0.003, 8, false),
    };
  }, []);
  const markers = useRef<(THREE.Mesh | null)[]>([]);
  const heart = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const phase = (clockRef.current * pulse) / 60;
    markers.current.forEach((marker, i) => {
      if (marker)
        (i < 4 ? prepared.outward : prepared.inward).getPointAt(
          (phase / 4 + (i % 4) / 4) % 1,
          marker.position,
        );
    });
    heart.current?.scale.setScalar(1 + Math.sin(phase * Math.PI * 2) * 0.07);
  });
  useEffect(
    () => () => {
      prepared.artery.dispose();
      prepared.vein.dispose();
    },
    [prepared],
  );
  return (
    <group>
      <mesh geometry={prepared.artery}>
        <meshBasicMaterial color="#ce8a7d" transparent opacity={0.65} />
      </mesh>
      <mesh geometry={prepared.vein}>
        <meshBasicMaterial color="#72a6cd" transparent opacity={0.65} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          ref={(node) => {
            markers.current[i] = node;
          }}
        >
          <sphereGeometry args={[0.006, 12, 10]} />
          <meshBasicMaterial color={i < 4 ? "#ffc2ae" : "#a4d6ff"} />
        </mesh>
      ))}
      <mesh ref={heart} position={[0.04, 1.26, 0.06]}>
        <sphereGeometry args={[0.024, 24, 20]} />
        <meshStandardMaterial color="#d69285" roughness={0.55} />
      </mesh>
      {labels ? (
        <>
          <Label position={[0.16, 1.32, 0.08]}>
            Heart landmark (schematic)
          </Label>
          <Label position={[0.22, 0.68, 0.1]}>Systemic flow diagram</Label>
        </>
      ) : null}
    </group>
  );
}

export default function AnatomyCanvas(props: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0.94, 2.65], fov: 42, near: 0.01, far: 20 }}
      dpr={[1, 1.75]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
      aria-label="Interactive adult clinical anatomy model"
    >
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#e5e8df", "#536554", 1.5]} />
      <directionalLight position={[2, 3, 4]} intensity={2.2} color="#ffead3" />
      <directionalLight
        position={[-2, 1, -2]}
        intensity={1.8}
        color="#a6c4cd"
      />
      <CameraRig view={props.view} revision={props.cameraRevision} />
      <ContextEvents onLost={props.onContextLost} />
      <RefreshScene
        revision={[
          props.mode,
          props.skin,
          props.selected,
          props.opacity,
          props.labels,
          props.breaths,
          props.pulse,
          props.time,
        ].join(":")}
      />
      <Suspense
        fallback={
          <Html center>
            <p style={labelStyle}>Loading reference anatomy…</p>
          </Html>
        }
      >
        <SceneClock
          time={props.time}
          playing={props.playing}
          clockRef={props.clockRef}
          onTime={props.onTime}
        />
        <AdultSurface {...props} />
        {props.mode === "surface" ? (
          <ExternalAnatomy skin={props.skin} />
        ) : null}
        {props.mode === "tissues" ? <TissueLayer {...props} /> : null}
        {props.mode === "breathing" ? <RespiratoryLayer {...props} /> : null}
        {props.mode === "circulation" ? <CirculationLayer {...props} /> : null}
        {props.labels && props.mode === "surface" ? (
          <>
            <Label position={[0.23, 1.22, 0.07]}>Thorax</Label>
            <Label position={[-0.25, 0.82, 0.1]}>Genital anatomy</Label>
          </>
        ) : null}
      </Suspense>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.008, 0]}>
        <circleGeometry args={[0.55, 72]} />
        <meshStandardMaterial color="#1c3029" roughness={1} />
      </mesh>
      <gridHelper
        args={[1.1, 12, "#4a6052", "#2e4539"]}
        position={[0, -0.006, 0]}
      />
    </Canvas>
  );
}
