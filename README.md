# Male Atlas

Interactive 3D atlas of an adult male: a photoreal nude surface that peels into **textbook anatomical plates** — numbered callouts, ink rims, and Netter-style color on named BodyParts3D meshes (muscle, viscera, vessels, nerves, skeleton, brain, genitalia).

## Phone app

On a phone the atlas **opens straight into the 3D view** (Julian, or your last look). Add it to the home screen:

- **iPhone:** Share → Add to Home Screen
- **Android:** Chrome menu → Install app, or the in-app install chip

Gestures: drag to orbit, pinch to zoom, two-finger drag to pan, tap skin to peel, **hold** to grow the window, **double-tap** a named part to isolate it. Side arrows step Full → Brain → Chest → Belly → Pelvis. Gold markers jump the camera. **Tour** walks the layers with Back/Next. **Focus** flies in on the selected mesh; **Pin label** keeps a numbered callout; **Plates** toggles the figure labels. Bottom tabs: View, Parts, Info.

The volunteer skin mesh has **no UVs**, so the atlas shades it in world space (lips, eyes, hair, areola, palms, scrotum) using the real mesh landmarks. Peel a window and a **ghost inner shell** keeps the body cavity. **Sagittal / coronal / axial** cut textbook sections. **Context** dims other systems so the selected organ reads as the figure.

## Run

```bash
npm install
python3 scripts/ingest_bodyparts3d.py   # downloads are expected in tmp/ already, or fetch the official zip first
python3 scripts/ingest_genitals.py      # optional: merge IS-A penis/testis meshes into reproductive.glb
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Tap **Open the atlas** or pick Julian, Malik, Kenji, or Diego.

## Nude genitalia

The volunteer skin mesh includes the external genitalia. The atlas:

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
- `T` tour, `Space` / `→` next step, `←` previous, `R` reset, `X` isolate, `H` hide, `U` undo hide, `F` focus, `P` pin label, `L` plates on/off, `C` context, `6` sagittal / `7` coronal / `8` axial / `0` clip off, `1`–`5` regions, `[` `]` previous/next region, `Esc` appearances
