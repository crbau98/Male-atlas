#!/usr/bin/env python3
"""Generate seamless, low-grain skin albedo / roughness / normal maps.

Albedo stays low-frequency so a full-body UV layout does not look like film grain.
Pores and fine wrinkles live in the normal/roughness maps for close-up views.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "skins"
SIZE = 2048


def hermite(t: np.ndarray) -> np.ndarray:
    return t * t * (3.0 - 2.0 * t)


def wrap_value_noise(h: int, w: int, cell: int, rng: np.random.Generator) -> np.ndarray:
    gy = max(h // cell, 4)
    gx = max(w // cell, 4)
    grid = rng.random((gy, gx), dtype=np.float32)
    ys = np.arange(h, dtype=np.float32) / cell
    xs = np.arange(w, dtype=np.float32) / cell
    y0 = np.floor(ys).astype(np.int32)
    x0 = np.floor(xs).astype(np.int32)
    fy = hermite(ys - y0)
    fx = hermite(xs - x0)
    y0m = np.mod(y0, gy)
    x0m = np.mod(x0, gx)
    y1m = np.mod(y0 + 1, gy)
    x1m = np.mod(x0 + 1, gx)
    n00 = grid[y0m[:, None], x0m[None, :]]
    n10 = grid[y1m[:, None], x0m[None, :]]
    n01 = grid[y0m[:, None], x1m[None, :]]
    n11 = grid[y1m[:, None], x1m[None, :]]
    return (
        n00 * (1 - fy)[:, None] * (1 - fx)[None, :]
        + n10 * fy[:, None] * (1 - fx)[None, :]
        + n01 * (1 - fy)[:, None] * fx[None, :]
        + n11 * fy[:, None] * fx[None, :]
    )


def fbm(h: int, w: int, rng: np.random.Generator, octaves: int, base: int) -> np.ndarray:
    acc = np.zeros((h, w), dtype=np.float32)
    amp = 1.0
    total = 0.0
    cell = base
    for _ in range(octaves):
        acc += amp * wrap_value_noise(h, w, max(cell, 8), rng)
        total += amp
        amp *= 0.5
        cell = max(cell // 2, 8)
    return acc / total


def pore_distance(h: int, w: int, cell: int, rng: np.random.Generator) -> np.ndarray:
    gy = max(h // cell, 4)
    gx = max(w // cell, 4)
    jitter = rng.random((gy, gx, 2), dtype=np.float32) * 0.82 + 0.09
    yy, xx = np.indices((h, w), dtype=np.float32)
    py = yy / cell
    px = xx / cell
    iy = np.floor(py).astype(np.int32)
    ix = np.floor(px).astype(np.int32)
    min_d = np.full((h, w), 8.0, dtype=np.float32)
    for oy in (-1, 0, 1):
        for ox in (-1, 0, 1):
            cy = np.mod(iy + oy, gy)
            cx = np.mod(ix + ox, gx)
            fy = (iy + oy).astype(np.float32) + jitter[cy, cx, 0]
            fx = (ix + ox).astype(np.float32) + jitter[cy, cx, 1]
            dist = (py - fy) ** 2 + (px - fx) ** 2
            min_d = np.minimum(min_d, dist)
    return np.sqrt(min_d)


def height_to_normal(height: np.ndarray, strength: float) -> np.ndarray:
    dx = np.gradient(height, axis=1)
    dy = np.gradient(height, axis=0)
    nx = -dx * strength
    ny = -dy * strength
    nz = np.ones_like(height)
    length = np.sqrt(nx * nx + ny * ny + nz * nz)
    normal = np.stack((nx / length, ny / length, nz / length), axis=-1)
    return normal * 0.5 + 0.5


def save_rgb(arr: np.ndarray, path: Path) -> None:
    img = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), mode="RGB")
    img.save(path, optimize=True)


def make_maps(
    seed: int,
    base_rgb: tuple[float, float, float],
    vein_rgb: tuple[float, float, float],
    name: str,
    write_normal: bool,
) -> None:
    rng = np.random.default_rng(seed)
    h = w = SIZE
    blotch = fbm(h, w, rng, 4, 280)
    vein = fbm(h, w, rng, 3, 140)
    wrinkle = fbm(h, w, rng, 3, 64)
    pores = pore_distance(h, w, 10, rng)
    pore_mask = np.clip(1.0 - pores / 0.22, 0.0, 1.0)
    pore_mask = pore_mask * pore_mask

    base = np.array(base_rgb, dtype=np.float32)
    vein_c = np.array(vein_rgb, dtype=np.float32)
    albedo = np.empty((h, w, 3), dtype=np.float32)
    mottling = (blotch - 0.5) * 0.028
    for c in range(3):
        albedo[:, :, c] = base[c] + mottling
    albedo += (vein[:, :, None] - 0.5) * (vein_c - base) * 0.09
    albedo -= pore_mask[:, :, None] * 0.016
    albedo = np.clip(albedo, 0.0, 1.0)

    roughness = np.clip(
        0.42 + (blotch - 0.5) * 0.06 + pore_mask * 0.11 + (wrinkle - 0.5) * 0.04,
        0.28,
        0.62,
    )

    height = (blotch - 0.5) * 0.045 + (wrinkle - 0.5) * 0.07 - pore_mask * 0.22
    normal = height_to_normal(height, 7.5)

    save_rgb(albedo, ROOT / f"skin-albedo-{name}.png")
    save_rgb(np.repeat(roughness[:, :, None], 3, axis=2), ROOT / f"skin-rough-{name}.png")
    if write_normal:
        save_rgb(normal, ROOT / "skin-normal.png")
    print("wrote", name)


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    make_maps(11, (0.95, 0.79, 0.70), (0.82, 0.46, 0.42), "fair", True)
    make_maps(23, (0.91, 0.76, 0.66), (0.78, 0.42, 0.36), "warm", False)
    make_maps(37, (0.80, 0.58, 0.45), (0.62, 0.32, 0.26), "olive", False)
    make_maps(41, (0.43, 0.24, 0.17), (0.32, 0.14, 0.11), "deep", False)


if __name__ == "__main__":
    main()
