#!/usr/bin/env python3
"""Bake a photoreal albedo onto Blender Studio's CC0 realistic male and export GLB.

Source mesh: Human Base Meshes v1.2, GEO-body_male_realistic (Dan Ulrich / Blender Studio, CC0).
Aligned to BodyParts3D volunteer space: meters, Y-up, feet on y=0, height 1.72m, +Z front.
"""

from pathlib import Path

import bpy
from mathutils import Matrix, Vector

BLEND = "/tmp/human-meshes/human_base_meshes_bundle.blend"
FRONT = "/tmp/male-real/front-nude.png"
BACK = "/tmp/male-real/back-nude.png"
OUT_GLB = "/workspace/public/models/photoreal-male.glb"
OUT_ALBEDO = "/workspace/public/skins/photoreal-male-albedo.png"
BAKE_RES = 2048
MULTIRES_LEVEL = 1
TARGET_HEIGHT = 1.72
THIGH_CUT = 0.42  # photo covers mid-thigh to head


def bbox(obj):
    pts = [v.co for v in obj.data.vertices]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx


def apply_world(obj):
    obj.data.transform(obj.matrix_world.copy())
    obj.matrix_world = Matrix.Identity(4)
    obj.data.update()


def transform_all(objs, matrix):
    for obj in objs:
        obj.data.transform(matrix)
        obj.data.update()
        obj.matrix_world = Matrix.Identity(4)


bpy.ops.wm.open_mainfile(filepath=BLEND)

body = bpy.data.objects["GEO-body_male_realistic"]
eyes = [
    bpy.data.objects["GEO-body_male_realistic.eye.L"],
    bpy.data.objects["GEO-body_male_realistic.eye.R"],
]
export_objects = [body, *eyes]

for obj in bpy.data.objects:
    obj.hide_set(False)
    obj.hide_viewport = False
    obj.hide_render = False

bpy.ops.object.select_all(action="DESELECT")
bpy.ops.object.mode_set(mode="OBJECT")

# Eyes are parented; keep world transform before we bake matrices.
for eye in eyes:
    mw = eye.matrix_world.copy()
    eye.parent = None
    eye.matrix_world = mw

body.data = body.data.copy()
for eye in eyes:
    eye.data = eye.data.copy()

keep = {body, *eyes}
for obj in list(bpy.data.objects):
    if obj not in keep:
        bpy.data.objects.remove(obj, do_unlink=True)

body.select_set(True)
bpy.context.view_layer.objects.active = body
for mod in list(body.modifiers):
    if mod.type == "MULTIRES":
        mod.levels = min(MULTIRES_LEVEL, mod.total_levels)
        mod.render_levels = mod.levels
        bpy.ops.object.modifier_apply(modifier=mod.name)
    else:
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except Exception:
            body.modifiers.remove(mod)

for obj in export_objects:
    apply_world(obj)
    obj.name = {
        "GEO-body_male_realistic": "PhotorealMale",
        "GEO-body_male_realistic.eye.L": "PhotorealEyeL",
        "GEO-body_male_realistic.eye.R": "PhotorealEyeR",
    }.get(obj.name, obj.name)
    obj.data.name = obj.name
    for poly in obj.data.polygons:
        poly.use_smooth = True

body = bpy.data.objects["PhotorealMale"]
eyes = [bpy.data.objects["PhotorealEyeL"], bpy.data.objects["PhotorealEyeR"]]
export_objects = [body, *eyes]

mn, mx = bbox(body)
size = mx - mn
offset = Vector((-(mn.x + mx.x) * 0.5, -(mn.y + mx.y) * 0.5, -mn.z))
height = size.z
scale = TARGET_HEIGHT / height if height else 1.0
T = Matrix.Translation(offset)
S = Matrix.Diagonal((scale, scale, scale, 1.0))
# Keep Blender Z-up. The glTF exporter converts to Three/Y-up.
transform_all(export_objects, S @ T)

mn, mx = bbox(body)
print("blender Z-up bounds", tuple(mn), tuple(mx), "verts", len(body.data.vertices), "faces", len(body.data.polygons))

# Groin landmark in Blender space (x, y=depth, z=height). Front is -Y.
crotch = [
    v.co.copy()
    for v in body.data.vertices
    if abs(v.co.x) < 0.05 and 0.72 < v.co.z < 0.96 and v.co.y < -0.02
]
if crotch:
    front = min(crotch, key=lambda p: p.y)
    print("crotch sample blender", tuple(front), "n", len(crotch))
    print("crotch sample yup", (front.x, front.z, -front.y))

front_img = bpy.data.images.load(FRONT)
back_img = bpy.data.images.load(BACK)

mesh = body.data
if "PhotoFront" not in mesh.uv_layers:
    mesh.uv_layers.new(name="PhotoFront")
if "PhotoBack" not in mesh.uv_layers:
    mesh.uv_layers.new(name="PhotoBack")
uv_f = mesh.uv_layers["PhotoFront"]
uv_b = mesh.uv_layers["PhotoBack"]
size = mx - mn
for li, loop in enumerate(mesh.loops):
    p = mesh.vertices[loop.vertex_index].co
    u = (p.x - mn.x) / max(size.x, 1e-6)
    v = (p.z - THIGH_CUT) / max(mx.z - THIGH_CUT, 1e-6)
    u = 0.08 + u * 0.84
    v = 0.02 + v * 0.96
    uv_f.data[li].uv = (u, v)
    uv_b.data[li].uv = (1.0 - u, v)

# The studio mesh ships as UDIM (u up to ~9). Pack into 0..1 so a single atlas bake covers the body.
mesh.uv_layers["UVMap"].active = True
bpy.ops.object.select_all(action="DESELECT")
body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.select_all(action="SELECT")
bpy.ops.uv.pack_islands(margin=0.002)
bpy.ops.object.mode_set(mode="OBJECT")
print("packed UVMap into 0-1")

# Sample a thigh/abdomen fill for clipped photo regions (lower legs, armpits).
px = list(front_img.pixels)
w, h = front_img.size
cx, cy = int(w * 0.5), int(h * 0.42)
fill = Vector((px[(cy * w + cx) * 4], px[(cy * w + cx) * 4 + 1], px[(cy * w + cx) * 4 + 2]))

mat = bpy.data.materials.new("PhotorealBake")
mat.use_nodes = True
nt = mat.node_tree
nt.nodes.clear()
out = nt.nodes.new("ShaderNodeOutputMaterial")
emit = nt.nodes.new("ShaderNodeEmission")
mix = nt.nodes.new("ShaderNodeMixRGB")
mix.use_clamp = True
front_tex = nt.nodes.new("ShaderNodeTexImage")
back_tex = nt.nodes.new("ShaderNodeTexImage")
front_tex.image = front_img
back_tex.image = back_img
front_tex.extension = "CLIP"
back_tex.extension = "CLIP"
uvmap_f = nt.nodes.new("ShaderNodeUVMap")
uvmap_f.uv_map = "PhotoFront"
uvmap_b = nt.nodes.new("ShaderNodeUVMap")
uvmap_b.uv_map = "PhotoBack"
nt.links.new(uvmap_f.outputs["UV"], front_tex.inputs["Vector"])
nt.links.new(uvmap_b.outputs["UV"], back_tex.inputs["Vector"])

geom = nt.nodes.new("ShaderNodeNewGeometry")
sep_n = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(geom.outputs["True Normal"], sep_n.inputs["Vector"])
# Front of this mesh is -Y in Blender. Map so front samples the front photo.
rng = nt.nodes.new("ShaderNodeMapRange")
rng.inputs["From Min"].default_value = 0.12
rng.inputs["From Max"].default_value = -0.12
rng.clamp = True
nt.links.new(sep_n.outputs["Y"], rng.inputs["Value"])
nt.links.new(rng.outputs["Result"], mix.inputs["Fac"])
nt.links.new(back_tex.outputs["Color"], mix.inputs["Color1"])
nt.links.new(front_tex.outputs["Color"], mix.inputs["Color2"])

# Replace clipped (black) projection with skin fill.
lum = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(mix.outputs["Color"], lum.inputs["Vector"])
add = nt.nodes.new("ShaderNodeMath")
add.operation = "ADD"
nt.links.new(lum.outputs["X"], add.inputs[0])
nt.links.new(lum.outputs["Y"], add.inputs[1])
add2 = nt.nodes.new("ShaderNodeMath")
add2.operation = "ADD"
nt.links.new(add.outputs["Value"], add2.inputs[0])
nt.links.new(lum.outputs["Z"], add2.inputs[1])
cmp = nt.nodes.new("ShaderNodeMath")
cmp.operation = "LESS_THAN"
cmp.inputs[1].default_value = 0.08
nt.links.new(add2.outputs["Value"], cmp.inputs[0])
fill_mix = nt.nodes.new("ShaderNodeMixRGB")
fill_mix.use_clamp = True
fill_rgb = nt.nodes.new("ShaderNodeRGB")
fill_rgb.outputs[0].default_value = (fill.x, fill.y, fill.z, 1)
nt.links.new(cmp.outputs["Value"], fill_mix.inputs["Fac"])
nt.links.new(mix.outputs["Color"], fill_mix.inputs["Color1"])
nt.links.new(fill_rgb.outputs["Color"], fill_mix.inputs["Color2"])

nt.links.new(fill_mix.outputs["Color"], emit.inputs["Color"])
nt.links.new(emit.outputs["Emission"], out.inputs["Surface"])
body.data.materials.clear()
body.data.materials.append(mat)

if "UVMap" not in mesh.uv_layers:
    raise RuntimeError("realistic male is missing UVMap")
mesh.uv_layers["UVMap"].active = True
mesh.uv_layers["UVMap"].active_render = True

bake_img = bpy.data.images.new("PhotorealAlbedo", BAKE_RES, BAKE_RES, alpha=False)
bake_node = nt.nodes.new("ShaderNodeTexImage")
bake_node.image = bake_img
bake_node.select = True
nt.nodes.active = bake_node

bpy.context.scene.render.engine = "CYCLES"
bpy.context.scene.cycles.device = "CPU"
bpy.context.scene.cycles.samples = 4
bpy.context.scene.cycles.bake_type = "EMIT"
bpy.context.scene.render.bake.use_pass_direct = False
bpy.context.scene.render.bake.use_pass_indirect = False
bpy.context.scene.render.bake.use_pass_emit = True
bpy.context.scene.render.bake.margin = 8

bpy.ops.object.select_all(action="DESELECT")
body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.object.bake(type="EMIT")

Path(OUT_ALBEDO).parent.mkdir(parents=True, exist_ok=True)
bake_img.filepath_raw = OUT_ALBEDO
bake_img.file_format = "PNG"
bake_img.save()

# Drop projection UV layers so the GLB stays small.
for name in list(mesh.uv_layers.keys()):
    if name != "UVMap":
        mesh.uv_layers.remove(mesh.uv_layers[name])

body.data.materials.clear()
for eye in eyes:
    eye.data.materials.clear()

bpy.ops.object.select_all(action="DESELECT")
for obj in export_objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = body
Path(OUT_GLB).parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB,
    use_selection=True,
    export_format="GLB",
    export_texcoords=True,
    export_normals=True,
    export_materials="PLACEHOLDER",
    export_cameras=False,
    export_lights=False,
    export_apply=True,
    export_extras=False,
)
print("exported", OUT_GLB, "albedo", OUT_ALBEDO)
print("faces", len(body.data.polygons), "verts", len(body.data.vertices))
