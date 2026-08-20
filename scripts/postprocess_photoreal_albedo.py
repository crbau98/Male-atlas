#!/usr/bin/env python3
"""Fill white CLIP holes and leftover navy brief pixels in the baked albedo."""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ALBEDO = Path("/workspace/public/skins/photoreal-male-albedo.png")


def main() -> None:
    rgb = np.array(Image.open(ALBEDO).convert("RGB"))
    lum = rgb.mean(axis=2)
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    white = (r > 225) & (g > 225) & (b > 220)
    navy = (lum < 55) & (b + 12 >= r) & (lum > 4)
    studio = (lum > 198) & (np.abs(r - g) < 18) & (np.abs(g - b) < 18)
    used = lum > 8
    holes = (white | navy | studio) & ndimage.binary_dilation(used, iterations=2)
    fill_src = used & ~holes
    _, indices = ndimage.distance_transform_edt(~fill_src, return_indices=True)
    filled = rgb[indices[0], indices[1]]
    alpha = ndimage.gaussian_filter(holes.astype(np.float32), 1.2)[..., None]
    out = np.clip(rgb * (1 - alpha) + filled * alpha, 0, 255).astype(np.uint8)
    Image.fromarray(out).save(ALBEDO)
    print("inpainted", ALBEDO, "holes", float(holes.mean()))


if __name__ == "__main__":
    main()
