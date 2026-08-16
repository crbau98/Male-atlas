#!/usr/bin/env python3
"""Inpaint dark briefs on the photoreal reference photos so the bake is nude."""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path("/tmp/male-real/front.png")
OUT_DIR = Path("/tmp/male-real")
FRONT_OUT = OUT_DIR / "front-nude.png"
BACK_OUT = OUT_DIR / "back-nude.png"


def feather(mask: np.ndarray, radius: int = 10) -> np.ndarray:
    dist_in = ndimage.distance_transform_edt(mask)
    dist_out = ndimage.distance_transform_edt(~mask)
    alpha = np.clip((dist_in - dist_out + radius) / (2 * radius), 0, 1)
    return ndimage.gaussian_filter(alpha, 1.6)


def inpaint_briefs(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    lum = rgb.mean(axis=2)
    yy, xx = np.mgrid[0:h, 0:w]
    yf = yy / h
    xf = xx / w

    groin = (yf > 0.56) & (yf < 0.88) & (xf > 0.28) & (xf < 0.72)
    dark = lum < 82
    navy = (rgb[:, :, 2] + 12 >= rgb[:, :, 0]) & (lum < 110)
    mask = groin & (dark | navy)
    mask = ndimage.binary_dilation(mask, iterations=10)
    mask = ndimage.binary_closing(mask, iterations=6)

    # Stretch nearby abdomen/thigh skin into the hole instead of a flat fill.
    _, indices = ndimage.distance_transform_edt(mask, return_indices=True)
    fill = rgb[indices[0], indices[1]].astype(np.float32)
    fill = ndimage.gaussian_filter(fill, sigma=(1.8, 1.8, 0))
    rng = np.random.default_rng(22108)
    mottling = ndimage.gaussian_filter(rng.normal(0, 7, rgb.shape), sigma=(2.2, 2.2, 0))
    fill = np.clip(fill + mottling, 0, 255)
    crease = np.exp(-((xf - 0.5) ** 2) / 0.00055) * np.clip((yf - 0.64) / 0.16, 0, 1)
    fill = fill * (1.0 - 0.10 * crease[..., None])

    alpha = feather(mask, 16)[..., None]
    out = rgb.astype(np.float32) * (1 - alpha) + fill * alpha
    return np.clip(out, 0, 255).astype(np.uint8)


def main() -> None:
    rgb = np.array(Image.open(SRC).convert("RGB"))
    nude = inpaint_briefs(rgb)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    Image.fromarray(nude).save(FRONT_OUT)
    Image.fromarray(np.fliplr(nude)).save(BACK_OUT)
    print("wrote", FRONT_OUT, BACK_OUT, "size", nude.shape)


if __name__ == "__main__":
    main()
