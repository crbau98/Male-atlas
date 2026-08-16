# Male Atlas

Interactive 3D atlas of an adult male: pick a photoreal nude appearance, then peel into named BodyParts3D anatomy (muscles, viscera, vessels, nerves, skeleton, parcellated brain, and male genitalia).

## Phone app

Open the site on a phone (Safari or Chrome). It is a standalone web app:

- **iPhone:** Share → Add to Home Screen
- **Android:** Chrome menu → Install app, or the in-app install chip

The 3D view fills the screen. Drag to orbit, pinch to zoom, two-finger drag to pan. Bottom tabs: **View** (dissection / Nude / Pelvis / Brain), **Parts** (search), **Info** (inspector). Systems load as you dissect so the first open stays light.

## Run

```bash
npm install
python3 scripts/ingest_bodyparts3d.py   # downloads are expected in tmp/ already, or fetch the official zip first
python3 scripts/ingest_genitals.py      # optional: merge IS-A penis/testis meshes into reproductive.glb
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Choose Julian, Malik, Kenji, or Diego. Click the body to open an anatomical window, or drag **Dissection**. **Pelvis** frames the perineum; **Nude** toggles the photoreal surface.

## Nude genitalia

The volunteer skin mesh includes the external genitalia. A tiled albedo made that region look like generic skin, so the atlas now:

1. Opens a window in the skin over the penile shaft
2. Draws BodyParts3D IS-A meshes for glans (`FJ3134`) and corpus cavernosum (`FJ3132`) with photoreal skin/mucosa
3. Paints scrotum and pubic hair on the remaining volunteer surface
4. Reveals corpus spongiosum, testes, and epididymides as you peel or raise dissection

## Data

Meshes come from [BodyParts3D 4.0](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) (adult male volunteer). The body uses the PART-OF tree; named penis and testis meshes come from the IS-A tree, both at 99% polygon reduction.

Required credit: **BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International**.

Gallery portraits are clothed appearance references, not the 3D face geometry.

This is an educational atlas, not a diagnostic device. BodyParts3D authors note residual mapping errors.

## Keys

- Click photoreal surface: peel window (genital region also selects the named part)
- `R` reset, `X` isolate, `H` hide, `Esc` appearances
