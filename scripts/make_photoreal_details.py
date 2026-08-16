#!/usr/bin/env python3
"""Build pore normals, genital albedos, and fill placeholder UV islands."""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path("/workspace/public/skins")
ALBEDO = ROOT / "photoreal-male-albedo.png"
PORE = ROOT / "skin-pore-normal.png"
GENITAL = ROOT / "photoreal-genital-albedo.png"
AROUSED = ROOT / "photoreal-genital-aroused.png"
FACE_SRC = Path("/tmp/male-real/face.png")
FACE_DST = ROOT / "photoreal-face.png"


def fbm(shape, octaves=5, seed=17):
    rng = np.random.default_rng(seed)
    h, w = shape
    acc = np.zeros((h, w), np.float32)
    amp = 1.0
    total = 0.0
    for i in range(octaves):
        gh, gw = max(4, h // (2 ** (octaves - 1 - i))), max(4, w // (2 ** (octaves - 1 - i)))
        grid = rng.standard_normal((gh, gw)).astype(np.float32)
        grid = ndimage.zoom(grid, (h / gh, w / gw), order=1)
        acc += amp * grid
        total += amp
        amp *= 0.5
    acc /= total
    acc -= acc.min()
    acc /= max(acc.max(), 1e-6)
    return acc


def height_to_normal(height, strength=6.0):
    dy, dx = np.gradient(height.astype(np.float32))
    n = np.stack((-dx * strength, -dy * strength, np.ones_like(height)), axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return np.clip((n * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)


def make_pore_normal():
    h = fbm((1024, 1024), octaves=6, seed=41)
    pores = fbm((1024, 1024), octaves=3, seed=90)
    pores = (pores > 0.62).astype(np.float32)
    pores = ndimage.gaussian_filter(pores, 0.7)
    height = h * 0.55 + pores * 0.45
    Image.fromarray(height_to_normal(height, 8.5)).save(PORE)
    print("wrote", PORE)


def vein_field(h, w, seed, count, width):
    rng = np.random.default_rng(seed)
    field = np.zeros((h, w), np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    for _ in range(count):
        x0 = rng.uniform(0, w)
        y0 = rng.uniform(h * 0.05, h * 0.78)
        ang = rng.uniform(-0.5, 0.5) + np.pi * 0.5
        length = rng.uniform(h * 0.18, h * 0.42)
        x1 = x0 + np.cos(ang) * length
        y1 = y0 + np.sin(ang) * length
        px = xx - x0
        py = yy - y0
        vx, vy = x1 - x0, y1 - y0
        mag = vx * vx + vy * vy + 1e-6
        t = np.clip((px * vx + py * vy) / mag, 0, 1)
        dist = np.abs(px * vy - py * vx) / np.sqrt(mag)
        field += np.exp(-0.5 * (dist / width) ** 2) * (1 - t) * 0.85
    return np.clip(field, 0, 1)


def make_genital_maps():
    body = np.array(Image.open(ALBEDO).convert("RGB")).astype(np.float32) / 255.0
    lum = body.mean(axis=2)
    sat = body.max(axis=2) - body.min(axis=2)
    skin = (lum > 0.28) & (lum < 0.82) & (sat > 0.08)
    sample = body[skin]
    base = sample.mean(axis=0) if len(sample) else np.array([0.78, 0.56, 0.48])
    h = w = 1024
    v = np.linspace(0, 1, h)[:, None]
    u = np.linspace(0, 1, w)[None, :]
    grain = fbm((h, w), octaves=6, seed=12)
    wrinkle = np.sin((u * 22 + grain * 4.0) * np.pi)
    wrinkle = ndimage.gaussian_filter(np.abs(wrinkle), 0.9)
    raphe = np.exp(-((u - 0.5) ** 2) / 0.0022)
    glans = np.clip((v - 0.72) / 0.28, 0, 1)
    corona = np.exp(-((v - 0.76) ** 2) / 0.0005)
    shaft = 1.0 - glans
    veins = vein_field(h, w, 63, 7, 2.4)

    rest = np.zeros((h, w, 3), np.float32)
    rest += base * (0.96 + grain[..., None] * 0.08) * shaft[..., None]
    glans_col = np.clip(base * np.array([1.05, 0.72, 0.68]) + np.array([0.08, 0.0, 0.0]), 0, 1)
    rest += glans_col * glans[..., None]
    rest *= 1.0 - wrinkle[..., None] * shaft[..., None] * 0.07
    rest *= 1.0 - raphe[..., None] * 0.08
    rest += corona[..., None] * np.array([0.12, 0.03, 0.03])
    rest -= veins[..., None] * np.array([0.07, 0.04, 0.02]) * shaft[..., None]
    rest = np.clip(rest, 0, 1)

    hot = np.clip(rest * np.array([0.94, 0.74, 0.72]) + glans[..., None] * np.array([0.12, 0.015, 0.02]), 0, 1)
    Image.fromarray((rest * 255).astype(np.uint8)).save(GENITAL)
    Image.fromarray((hot * 255).astype(np.uint8)).save(AROUSED)
    print("wrote", GENITAL, AROUSED, "base", base)


def fill_placeholders():
    rgb = np.array(Image.open(ALBEDO).convert("RGB"))
    r, g, b = rgb[:, :, 0].astype(np.int16), rgb[:, :, 1].astype(np.int16), rgb[:, :, 2].astype(np.int16)
    lum = rgb.mean(axis=2)
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    gray = (sat < 16) & (lum > 78) & (lum < 190)
    gray = ndimage.binary_dilation(gray, iterations=2)
    used = lum > 12
    fill_src = used & ~gray
    _, indices = ndimage.distance_transform_edt(~fill_src, return_indices=True)
    filled = rgb[indices[0], indices[1]]
    alpha = ndimage.gaussian_filter(gray.astype(np.float32), 1.4)[..., None]
    grain = (fbm(lum.shape, seed=5) * 14 - 7)[..., None]
    blended = rgb * (1 - alpha) + np.clip(filled.astype(np.float32) + grain, 0, 255) * alpha
    Image.fromarray(np.clip(blended, 0, 255).astype(np.uint8)).save(ALBEDO)
    print("filled placeholders", float(gray.mean()))


def copy_face():
    if FACE_SRC.exists():
        Image.open(FACE_SRC).convert("RGB").save(FACE_DST, quality=95)
        print("wrote", FACE_DST)


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    make_pore_normal()
    make_genital_maps()
    fill_placeholders()
    copy_face()


if __name__ == "__main__":
    main()
