# Third-party assets

## BodyParts3D

Polygon meshes and FMA labels: BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

Source: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html

Citation: Mitsuhashi N, Fujieda K, Tamura T, Kawamoto S, Takagi T, Okubo K. BodyParts3D: 3D structure database for anatomical concepts. Nucleic Acids Res. 2008.

## Male base mesh (unused fallback)

`public/models/male_base_mesh.glb` is the CC0 male base mesh by orange-juice-games, mirrored at https://github.com/BoQsc/Godot-3D-Male-Base-Mesh.

## Photoreal male surface

`public/models/photoreal-male.glb` is Blender Studio's **Human Base Meshes** realistic male (`GEO-body_male_realistic`) by Dan Ulrich, CC0.

Source: https://studio.blender.org/films/sprite-fright/gallery/?asset=4205

The photographic albedo in `public/skins/photoreal-male-albedo.png` is baked for this atlas. Rebuild with:

```bash
python3 scripts/prepare_photoreal_photos.py
blender -b -P scripts/export_photoreal_male.py
python3 scripts/postprocess_photoreal_albedo.py
```

## Skin and portrait stills

Generated material tiles and clothed catalog portraits shipped in `public/skins` and `public/appearances` for the four appearance presets.
