import * as THREE from "three";

export function prepSkinMap(
  texture: THREE.Texture,
  color: boolean,
  anisotropy: number,
  repeat: number,
) {
  const map = texture.clone();
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  map.anisotropy = anisotropy;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.magFilter = THREE.LinearFilter;
  map.generateMipmaps = true;
  map.repeat.set(repeat, repeat);
  map.needsUpdate = true;
  return map;
}

export function closeupAmount(distance: number) {
  const t = THREE.MathUtils.smoothstep(1.65, 0.26, distance);
  return t * t * (3 - 2 * t);
}
