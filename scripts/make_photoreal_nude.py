#!/usr/bin/env python3
"""Replace navy briefs with stretched photographic skin and mask the studio backdrop."""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path("/tmp/male-real/front.png")
FALLBACK = Path("/workspace/public/skins/photoreal-front.png")
OUT_DIR = Path("/workspace/public/skins")
FRONT_OUT = OUT_DIR / "photoreal-front.png"
BACK_OUT = OUT_DIR / "photoreal-back.png"
PATCH_OUT = OUT_DIR / "photoreal-genital-albedo.png"
AROUSED_OUT = OUT_DIR / "photoreal-genital-aroused.png"


def fbm(shape, octaves=5, seed=17):
    rng = np.random.default_rng(seed)
    h, w = shape
    acc = np.zeros((h, w), np.float32)
    total = 0.0
    amp = 1.0
    for i in range(octaves):
        gh = max(4, h // (2 ** (octaves - 1 - i)))
        gw = max(4, w // (2 ** (octaves - 1 - i)))
        grid = rng.standard_normal((gh, gw)).astype(np.float32)
        grid = ndimage.zoom(grid, (h / gh, w / gw), order=1)
        acc += amp * grid
        total += amp
        amp *= 0.5
    acc /= total
    acc -= acc.min()
    acc /= max(acc.max(), 1e-6)
    return acc


def body_mask(rgb: np.ndarray) -> np.ndarray:
    luma = rgb[:, :, 0] * 0.299 + rgb[:, :, 1] * 0.587 + rgb[:, :, 2] * 0.114
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    skin = (sat > 16) & (luma > 22) & (luma < 248)
    hair = (luma < 78) & (sat < 55)
    h, w = luma.shape
    yy, xx = np.mgrid[0:h, 0:w]
    head = (yy < h * 0.3) & (np.abs(xx / w - 0.515) < 0.16)
    mask = skin | (hair & head)
    mask = ndimage.binary_closing(mask, iterations=3)
    mask = ndimage.binary_dilation(mask, iterations=1)
    mask = ndimage.binary_fill_holes(mask)
    return mask


def briefs_mask(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    yy, xx = np.mgrid[0:h, 0:w]
    yf, xf = yy / h, xx / w
    box = (yf > 0.632) & (yf < 0.818) & (xf > 0.30) & (xf < 0.73)
    navy = (rgb[:, :, 2] + 14 >= rgb[:, :, 0]) & (lum < 112) & (sat < 90)
    mask = box & navy
    mask = ndimage.binary_dilation(mask, iterations=10)
    mask = ndimage.binary_closing(mask, iterations=6)
    mask = ndimage.binary_fill_holes(mask)
    mask &= box
    return mask


def inpaint_briefs(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    mask = briefs_mask(rgb)
    if not mask.any():
        return rgb
    src = rgb.astype(np.float32)
    luma = src[:, :, 0] * 0.299 + src[:, :, 1] * 0.587 + src[:, :, 2] * 0.114
    sat = src.max(axis=2) - src.min(axis=2)
    background = (luma > 200) & (sat < 22)
    skin = body_mask(rgb) & ~mask & ~background
    _, idx = ndimage.distance_transform_edt(~skin, return_indices=True)
    fill = src[idx[0], idx[1]]
    fill = ndimage.gaussian_filter(fill, sigma=(5.5, 4.2, 0))
    grain = fbm((h, w), seed=29)
    fill = np.clip(fill * (0.97 + grain[..., None] * 0.05), 0, 255)
    xf = (np.arange(w) / w - 0.515) / 0.175
    yf = (np.arange(h) / h - 0.70) / 0.08
    crease = np.exp(-(xf[None, :] ** 2) / 0.08) * np.clip(1.0 - np.abs(yf[:, None]), 0, 1)
    fill *= 1.0 - 0.08 * crease[..., None]
    pubic = np.exp(-(xf[None, :] ** 2) / 0.22) * np.clip(1.0 - np.abs((np.arange(h) / h - 0.69) / 0.05)[:, None], 0, 1)
    pubic *= mask
    strands = np.abs(np.sin(np.arange(w)[None, :] * 0.7 + grain * 7.0 + np.arange(h)[:, None] * 0.11))
    pubic_col = np.array([48.0, 32.0, 24.0])
    fill = fill * (1.0 - pubic[..., None] * strands[..., None] * 0.28) + pubic_col * (
        pubic * strands * 0.28
    )[..., None]
    dist = ndimage.distance_transform_edt(~mask)
    alpha = np.clip((14.0 - dist) / 14.0, 0, 1)
    alpha = ndimage.gaussian_filter(alpha.astype(np.float32), 1.8)
    out = src * (1 - alpha[..., None]) + fill * alpha[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)


def mask_backdrop(rgb: np.ndarray, mask: np.ndarray) -> np.ndarray:
    alpha = ndimage.gaussian_filter(mask.astype(np.float32), 0.7)
    alpha = np.clip(alpha, 0, 1)
    return (rgb.astype(np.float32) * alpha[..., None]).astype(np.uint8)


def genital_patch(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    h, w, _ = rgb.shape
    # Lower abdomen / upper pelvis skin, not the navel.
    patch = rgb[int(h * 0.50) : int(h * 0.62), int(w * 0.40) : int(w * 0.60)]
    patch = np.array(Image.fromarray(patch).resize((1024, 1024), Image.Resampling.LANCZOS)).astype(np.float32)
    grain = fbm((1024, 1024), seed=12)
    rest = np.clip(patch * (0.98 + grain[..., None] * 0.05), 0, 255)
    v = np.linspace(0, 1, 1024)[:, None]
    glans = np.clip((v - 0.72) / 0.28, 0, 1)
    hot = np.clip(rest * np.array([1.02, 0.84, 0.80]) + glans[..., None] * np.array([22.0, 2.0, 4.0]), 0, 255)
    return rest.astype(np.uint8), hot.astype(np.uint8)


def main() -> None:
    src = SRC if SRC.exists() else FALLBACK
    rgb = np.array(Image.open(src).convert("RGB"))
    silhouette = body_mask(rgb) | briefs_mask(rgb)
    silhouette = ndimage.binary_fill_holes(silhouette)
    nude = inpaint_briefs(rgb)
    masked = mask_backdrop(nude, silhouette)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    Image.fromarray(masked).save(FRONT_OUT)
    Image.fromarray(np.fliplr(masked)).save(BACK_OUT)
    rest, hot = genital_patch(nude)
    Image.fromarray(rest).save(PATCH_OUT)
    Image.fromarray(hot).save(AROUSED_OUT)
    print("wrote", FRONT_OUT, BACK_OUT, PATCH_OUT, "from", src, "briefs", float(briefs_mask(rgb).mean()))


if __name__ == "__main__":
    main()
