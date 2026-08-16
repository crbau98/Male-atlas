#!/usr/bin/env python3
"""Merge BodyParts3D IS-A genital meshes into reproductive.glb."""

from __future__ import annotations

import json
import zipfile
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[1]
ZIP_PATH = ROOT / "tmp" / "isa_BP3D_4.0_obj_99.zip"
OBJ_DIR = ROOT / "tmp" / "bp3d" / "partof_BP3D_4.0_obj_99"
OUT = ROOT / "public" / "models" / "systems" / "reproductive.glb"
CATALOG = ROOT / "src" / "data" / "catalog.json"

GENITAL = {
    "FJ3134": ("FMA18247", "glans penis"),
    "FJ3132": ("FMA19618", "corpus cavernosum of penis"),
    "FJ3133": ("FMA19617", "corpus spongiosum of penis"),
    "FJ3138": ("FMA7212", "left testis"),
    "FJ3142": ("FMA7211", "right testis"),
    "FJ3136": ("FMA18257", "left epididymis"),
    "FJ3141": ("FMA18256", "right epididymis"),
}


def transform(vertices: np.ndarray, zmin: float) -> np.ndarray:
    x = vertices[:, 0] / 1000.0
    y = (vertices[:, 2] - zmin) / 1000.0
    z = -vertices[:, 1] / 1000.0
    return np.column_stack([x, y, z]).astype(np.float32)


def skin_zmin() -> float:
    skin = trimesh.load(OBJ_DIR / "FJ2810.obj", force="mesh", process=False)
    return float(skin.vertices[:, 2].min())


def extract_objs(dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    if not ZIP_PATH.exists():
        raise SystemExit(f"Missing {ZIP_PATH}")
    with zipfile.ZipFile(ZIP_PATH) as zf:
        names = zf.namelist()
        for fj in GENITAL:
            match = next((n for n in names if n.endswith(f"{fj}.obj")), None)
            if not match:
                print("missing", fj)
                continue
            target = dest / f"{fj}.obj"
            target.write_bytes(zf.read(match))
            print("extracted", match, "->", target)


def main() -> None:
    raw = ROOT / "tmp" / "isa_genitals"
    extract_objs(raw)
    zmin = skin_zmin()
    scene = trimesh.Scene()
    existing = trimesh.load(OUT) if OUT.exists() else trimesh.Scene()
    if isinstance(existing, trimesh.Scene):
        for name, geom in existing.geometry.items():
            scene.add_geometry(geom, geom_name=name, node_name=name)

    catalog = json.loads(CATALOG.read_text())
    by_id = {p["id"]: p for p in catalog["parts"]}

    for fj, (fma, name) in GENITAL.items():
        path = raw / f"{fj}.obj"
        if not path.exists():
            continue
        mesh = trimesh.load(path, force="mesh", process=False)
        if not isinstance(mesh, trimesh.Trimesh):
            continue
        mesh.vertices = transform(np.asarray(mesh.vertices), zmin)
        colors = np.tile(np.array([201, 137, 168, 255], dtype=np.uint8), (len(mesh.vertices), 1))
        mesh.visual = trimesh.visual.ColorVisuals(mesh=mesh, vertex_colors=colors)
        scene.add_geometry(mesh, geom_name=fj, node_name=fj)
        by_id[fj] = {
            "id": fj,
            "fmaId": fma,
            "name": name,
            "system": "reproductive",
            "laterality": "left" if name.startswith("left") else "right" if name.startswith("right") else "median",
            "aliases": [],
            "file": "/models/systems/reproductive.glb",
            "triangles": int(len(mesh.faces)),
        }
        print(fj, name, len(mesh.faces), "faces")

    scene.export(OUT)
    catalog["parts"] = sorted(by_id.values(), key=lambda p: p["name"].lower())
    catalog["meta"]["partCount"] = len(catalog["parts"])
    if "reproductive" not in catalog["systems"]:
        catalog["systems"].append("reproductive")
    CATALOG.write_text(json.dumps(catalog, indent=2))
    print("wrote", OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
