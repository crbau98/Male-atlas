import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { STRUCTURES } from "../src/app/research/anatomy/anatomy-data.ts";

function readGlb(relativePath) {
  const bytes = readFileSync(new URL(relativePath, import.meta.url));
  assert.equal(bytes.toString("ascii", 0, 4), "glTF");
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  assert.equal(bytes.toString("ascii", 16, 20), "JSON");
  return JSON.parse(bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)));
}

test("every selectable structure resolves to an actual shipped reproductive mesh", () => {
  const glb = readGlb("../public/models/systems/reproductive.glb");
  const names = new Set(glb.meshes.map((mesh) => mesh.name));
  const ids = STRUCTURES.map((part) => part.id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    "structure identifiers must be unique",
  );
  for (const part of STRUCTURES)
    assert.ok(names.has(part.id), `${part.name} has no mesh`);
});

test("surface and breathing assets contain the objects the viewer animates", () => {
  const body = readGlb("../public/models/photoreal-male.glb");
  assert.ok(body.meshes.some((mesh) => mesh.name === "PhotorealMale"));
  const respiratory = readGlb("../public/models/systems/respiratory.glb");
  assert.ok(
    respiratory.meshes.some((mesh) => mesh.name === "FJ3131"),
    "diaphragm missing",
  );
});
