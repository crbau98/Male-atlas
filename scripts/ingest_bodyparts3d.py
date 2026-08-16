#!/usr/bin/env python3
"""Convert BodyParts3D PART-OF OBJ meshes into Y-up meter GLBs + catalog.json."""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[1]
OBJ_DIR = ROOT / "tmp" / "bp3d" / "partof_BP3D_4.0_obj_99"
META_DIR = ROOT / "tmp"
OUT_MODELS = ROOT / "public" / "models" / "systems"
OUT_DATA = ROOT / "src" / "data"

SYSTEM_RULES: list[tuple[str, tuple[str, ...]]] = [
    (
            "reproductive",
        (
            "testis",
            "prostate",
            "penis",
            "epididymis",
            "ductus deferens",
            "seminal",
            "scrotum",
            "spermatic",
            "ejaculatory",
            "glans",
            "corpus cavernosum",
            "corpus spongiosum",
            "prepuce",
            "tunica vaginalis",
            "bulbourethral",
            "perineum",
        ),
    ),
    (
        "urinary",
        ("kidney", "ureter", "bladder", "urethra", "renal", "calyx", "nephron"),
    ),
    (
        "lymphatic",
        ("lymph", "spleen", "thymus", "thoracic duct", "cisterna chyli"),
    ),
    (
        "cardiovascular",
        (
            "artery",
            "vein",
            "aorta",
            "heart",
            "ventricle",
            "atrium",
            "caval",
            "coronary",
            "vascular",
            "vena ",
            "sinus of valsalva",
            "pulmonary trunk",
            "endocardium",
            "myocardium",
            "pericard",
            "valve",
            "cusp",
            "leaflet of",
            "plantar arch",
            "thyrocervical",
            "costocervical",
            "celiac",
            "myocardial",
        ),
    ),
    (
        "nervous",
        (
            "brain",
            "nerve",
            "spinal cord",
            "gyrus",
            "cortex",
            "thalamus",
            "hypothalamus",
            "hippocamp",
            "cerebell",
            "brainstem",
            "pons",
            "medulla",
            "white matter",
            "grey matter",
            "gray matter",
            "ganglion",
            "plexus",
            "meninges",
            "dura",
            "arachnoid",
            "pia",
            "forebrain",
            "midbrain",
            "hindbrain",
            "epithalamus",
            "amygdala",
            "putamen",
            "caudate",
            "pallidum",
            "insula",
            "sulcus",
            "chiasm",
            "optic tract",
            "cranial",
            "ventricle of brain",
            "cerebral",
            "neur",
            "fasciculus",
            "tract of",
            "commissure",
            "tegmentum",
            "tectum",
            "olive of medulla",
            "olive",
            "colliculus",
            "habenula",
            "internal capsule",
            "parietal lobule",
            "tuber cinereum",
        ),
    ),
    (
        "respiratory",
        (
            "lung",
            "trachea",
            "bronchus",
            "bronchi",
            "larynx",
            "alveol",
            "pleura",
            "diaphragm",
            "bronchiole",
            "epiglottis",
            "vocal",
            "cricoid",
            "thyroid cartilage",
        ),
    ),
    (
        "digestive",
        (
            "liver",
            "stomach",
            "intestine",
            "colon",
            "ileum",
            "jejunum",
            "duodenum",
            "cecum",
            "caecum",
            "rectum",
            "esophagus",
            "oesophagus",
            "pancreas",
            "gallbladder",
            "bile",
            "pharynx",
            "tongue",
            "parotid",
            "submandibular",
            "sublingual",
            "tooth",
            "teeth",
            "oral",
            "appendix",
            "omentum",
            "mesenter",
            "hepatic",
            "portal vein",
            "anal",
            "sigmoid",
            "cystic duct",
            "pancreatic duct",
            "hepatovenous",
            "taenia",
            "uvula",
            "gingiva",
            "jaw",
        ),
    ),
    (
        "endocrine",
        ("thyroid", "adrenal", "pituitary", "pineal", "parathyroid", "hypophysis"),
    ),
    (
        "sensory",
        (
            "eye",
            "ear",
            "cochlea",
            "retina",
            "cornea",
            "lens",
            "sclera",
            "vitreous",
            "tympanic",
            "ossicle",
            "malleus",
            "incus",
            "stapes",
            "eyelid",
            "lacrimal",
            "iris",
            "choroid",
            "vestibule",
            "semicircular",
        ),
    ),
    (
        "muscular",
        (
            "muscle",
            "tendon",
            "aponeurosis",
            "ligament",
            "anconeus",
            "brachialis",
            "coracobrachialis",
            "oblique",
            "obturator",
            "piriformis",
            "psoas",
            "rhomboid",
            "serratus",
            "subclavius",
            "transversus",
            "levator",
            "rectus",
            "gluteus",
            "biceps",
            "triceps",
            "deltoid",
            "pectoralis",
            "latissimus",
            "trapezius",
            "gastrocnemius",
            "soleus",
            "sartorius",
            "quadriceps",
            "hamstring",
            "iliacus",
            "masseter",
            "temporalis",
            "pterygoid",
            "buccinator",
        ),
    ),
    (
        "skeletal",
        (
            "bone",
            "vertebra",
            "rib",
            "skull",
            "femur",
            "tibia",
            "fibula",
            "humerus",
            "radius",
            "ulna",
            "carpal",
            "tarsal",
            "clavicle",
            "scapula",
            "sternum",
            "pelvis",
            "ilium",
            "ischium",
            "pubis",
            "sacrum",
            "coccyx",
            "patella",
            "mandible",
            "maxilla",
            "cartilage",
            "phalanx",
            "metacarpal",
            "metatarsal",
            "hyoid",
            "calcaneus",
            "talus",
            "cranium",
            "occipital",
            "temporal bone",
            "frontal bone",
            "parietal bone",
            "sphenoid",
            "ethmoid",
            "zygomatic",
            "nasal bone",
            "vomer",
            "lacrimal bone",
            "palatine",
            "disc",
            "atlas",
            "axis",
            "manubrium",
            "xiphoid",
            "capitate",
            "hamate",
            "lunate",
            "pisiform",
            "scaphoid",
            "trapezium",
            "trapezoid",
            "triquetral",
            "hip",
            "knee",
            "concha",
        ),
    ),
    ("integument", ("skin", "integument", "nail", "dermis", "epidermis", "hair", "cheek", "fascia")),
]

SYSTEM_COLORS = {
    "integument": [210, 160, 140],
    "skeletal": [242, 236, 220],
    "muscular": [178, 58, 72],
    "cardiovascular": [196, 30, 58],
    "lymphatic": [110, 186, 150],
    "nervous": [232, 186, 210],
    "respiratory": [232, 176, 184],
    "digestive": [196, 160, 100],
    "urinary": [212, 196, 90],
    "reproductive": [201, 137, 168],
    "endocrine": [143, 188, 143],
    "sensory": [158, 201, 232],
    "other": [170, 170, 180],
}

MAX_FACES = {
    "integument": 90000,
    "default": 28000,
}


def classify(name: str) -> str:
    n = name.lower()
    for system, keys in SYSTEM_RULES:
        if any(k in n for k in keys):
            return system
    return "other"


def laterality(name: str) -> str:
    n = name.lower()
    if n.startswith("left ") or " left " in n:
        return "left"
    if n.startswith("right ") or " right " in n:
        return "right"
    return "median"


def load_tables() -> tuple[dict[str, list[tuple[str, str]]], dict[str, str]]:
    """FJ id -> list of (fma, name); fma -> preferred english name."""
    fj_concepts: dict[str, list[tuple[str, str]]] = defaultdict(list)
    fma_names: dict[str, str] = {}
    parts_path = META_DIR / "partof_parts_list_e.txt"
    for line in parts_path.read_text(encoding="utf-8", errors="replace").splitlines()[1:]:
        cols = line.split("\t")
        if len(cols) >= 3:
            fma_names[cols[0]] = cols[2]

    elem_path = META_DIR / "partof_element_parts.txt"
    for line in elem_path.read_text(encoding="utf-8", errors="replace").splitlines()[1:]:
        cols = line.split("\t")
        if len(cols) >= 3:
            fma, name, fj = cols[0], cols[1], cols[2].strip()
            fj_concepts[fj].append((fma, name))
            fma_names.setdefault(fma, name)
    return fj_concepts, fma_names


def pick_label(concepts: list[tuple[str, str]], fj_counts: dict[str, int]) -> tuple[str, str]:
    """Most specific FMA: fewest element files, then shortest name."""
    ranked = sorted(concepts, key=lambda c: (fj_counts.get(c[0], 9999), len(c[1]), c[1]))
    return ranked[0]


def transform_vertices(vertices: np.ndarray, zmin: float) -> np.ndarray:
    """BodyParts3D mm Z-up -> meters Y-up, feet on y=0."""
    x = vertices[:, 0] / 1000.0
    y = (vertices[:, 2] - zmin) / 1000.0
    z = -vertices[:, 1] / 1000.0
    return np.column_stack([x, y, z]).astype(np.float32)


def load_obj(path: Path) -> trimesh.Trimesh | None:
    try:
        loaded = trimesh.load(path, force="mesh", process=False)
    except Exception as exc:
        print(f"skip {path.name}: {exc}", file=sys.stderr)
        return None
    if isinstance(loaded, trimesh.Scene):
        geoms = [g for g in loaded.geometry.values() if isinstance(g, trimesh.Trimesh)]
        if not geoms:
            return None
        loaded = trimesh.util.concatenate(geoms)
    if not isinstance(loaded, trimesh.Trimesh) or len(loaded.faces) == 0:
        return None
    return loaded


def maybe_simplify(mesh: trimesh.Trimesh, target: int) -> trimesh.Trimesh:
    if len(mesh.faces) <= target:
        return mesh
    try:
        simplified = mesh.simplify_quadric_decimation(face_count=target)
        if isinstance(simplified, trimesh.Trimesh) and len(simplified.faces) > 0:
            return simplified
    except Exception as exc:
        print(f"simplify failed ({len(mesh.faces)} faces): {exc}", file=sys.stderr)
    return mesh


def main() -> None:
    if not OBJ_DIR.exists():
        raise SystemExit(f"Missing OBJ dir {OBJ_DIR}")

    OUT_MODELS.mkdir(parents=True, exist_ok=True)
    OUT_DATA.mkdir(parents=True, exist_ok=True)

    fj_concepts, _fma_names = load_tables()
    fma_elem_counts: dict[str, int] = defaultdict(int)
    for concepts in fj_concepts.values():
        seen = {fma for fma, _ in concepts}
        for fma in seen:
            fma_elem_counts[fma] += 1

    # Discover on-disk OBJ stems (FJ3011 or FJ1452M)
    disk_files = {p.stem: p for p in OBJ_DIR.glob("*.obj")}

    # Skin Z min from header or mesh
    skin = load_obj(OBJ_DIR / "FJ2810.obj")
    if skin is None:
        raise SystemExit("Skin mesh FJ2810.obj missing")
    zmin = float(skin.vertices[:, 2].min())

    grouped: dict[str, list[dict]] = defaultdict(list)
    catalog_parts: list[dict] = []

    for stem, path in sorted(disk_files.items()):
        concepts = fj_concepts.get(stem)
        if not concepts:
            # Some files use an M suffix; try without it
            concepts = fj_concepts.get(re.sub(r"M$", "", stem), [("unknown", stem)])
        fma, name = pick_label(concepts, fma_elem_counts)
        system = classify(name)
        grouped[system].append(
            {
                "id": stem,
                "path": path,
                "fmaId": fma,
                "name": name,
                "system": system,
                "laterality": laterality(name),
                "aliases": sorted({c[1] for c in concepts if c[1] != name}),
            }
        )

    bbox_min = np.array([1e9, 1e9, 1e9], dtype=np.float64)
    bbox_max = np.array([-1e9, -1e9, -1e9], dtype=np.float64)

    system_order = [
        "integument",
        "skeletal",
        "nervous",
        "muscular",
        "cardiovascular",
        "respiratory",
        "digestive",
        "urinary",
        "reproductive",
        "endocrine",
        "sensory",
        "lymphatic",
        "other",
    ]
    for system in system_order:
        parts = grouped.get(system)
        if not parts:
            continue
        print(f"=== {system}: {len(parts)} meshes ===")
        scene = trimesh.Scene()
        color = SYSTEM_COLORS.get(system, SYSTEM_COLORS["other"])
        target_faces = MAX_FACES.get(system, MAX_FACES["default"])
        added = 0
        for part in parts:
            mesh = load_obj(part["path"])
            if mesh is None:
                continue
            mesh = maybe_simplify(mesh, target_faces)
            mesh.vertices = transform_vertices(np.asarray(mesh.vertices), zmin)
            vertex_colors = np.tile(
                np.array([*color, 255], dtype=np.uint8), (len(mesh.vertices), 1)
            )
            mesh.visual = trimesh.visual.ColorVisuals(
                mesh=mesh, vertex_colors=vertex_colors
            )
            try:
                mesh.fix_normals()
            except Exception:
                pass
            node = part["id"]
            scene.add_geometry(mesh, geom_name=node, node_name=node)
            bbox_min = np.minimum(bbox_min, mesh.bounds[0])
            bbox_max = np.maximum(bbox_max, mesh.bounds[1])
            part.pop("path")
            part["file"] = f"/models/systems/{system}.glb"
            part["triangles"] = int(len(mesh.faces))
            catalog_parts.append(part)
            added += 1
        if added == 0:
            continue
        out = OUT_MODELS / f"{system}.glb"
        scene.export(out)
        print(f"  wrote {out} ({out.stat().st_size / 1e6:.1f} MB, {added} nodes)")

    catalog_parts.sort(key=lambda p: p["name"].lower())
    catalog = {
        "meta": {
            "source": "BodyParts3D 4.0 PART-OF tree",
            "attribution": "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International",
            "units": "meters",
            "up": "y",
            "heightMeters": float(bbox_max[1] - bbox_min[1]),
            "bounds": {
                "min": bbox_min.tolist(),
                "max": bbox_max.tolist(),
            },
            "partCount": len(catalog_parts),
        },
        "systems": sorted({p["system"] for p in catalog_parts}),
        "parts": catalog_parts,
    }
    out_json = OUT_DATA / "catalog.json"
    out_json.write_text(json.dumps(catalog, indent=2), encoding="utf-8")
    print(f"catalog {len(catalog_parts)} parts -> {out_json}")


if __name__ == "__main__":
    main()
