# Male Atlas

Interactive 3D atlas of an adult male: pick a photoreal appearance, then peel into named BodyParts3D anatomy (muscles, viscera, vessels, nerves, skeleton, parcellated brain).

## Run

```bash
npm install
python3 scripts/ingest_bodyparts3d.py   # downloads are expected in tmp/ already, or fetch the official zip first
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Choose Julian, Malik, Kenji, or Diego. Click the body to open an anatomical window, or drag **Dissection**.

## Data

Meshes come from [BodyParts3D 4.0](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) (adult male volunteer, PART-OF tree, 99% polygon reduction).

Required credit: **BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International**.

The photoreal layer is the volunteer skin mesh (`FJ2810`) with PBR skin, hair and iris looks. Gallery portraits are clothed appearance references, not the 3D face geometry.

This is an educational atlas, not a diagnostic device. BodyParts3D authors note residual mapping errors.

## Keys

- Click photoreal surface: peel window
- `R` reset, `X` isolate, `H` hide, `Esc` appearances
