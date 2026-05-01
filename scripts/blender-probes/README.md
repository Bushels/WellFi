# Blender Probe Scripts

One-shot debug/inspection scripts originally used during the March 2026 hero-animation work to interrogate the side-clamp GLB model. Preserved here so the working knowledge isn't lost when scratch directories get cleaned up.

## Scripts

| Script | Purpose |
|---|---|
| `inspect_materials.py` | Print mesh → material → base color (BSDF Principled) for every object in `wellfi-sideclamp.glb`. Useful when material colors look wrong in the rendered output. |
| `inspect_sideclamp_glb.py` | Print mesh count, per-mesh location/rotation/scale, and world-space bounding boxes. Useful for diagnosing scale or origin drift. |
| `orientation_probe.py` | Render a 360° orientation grid of the side-clamp at multiple angles. Output: PNG strips. Used to visually verify the model orientation against approved reference images. |
| `yaw_probe.py` | Same as orientation_probe but yaw-only. Narrower exploration when you already know pitch/roll are correct. |

## Running

These are Blender Python scripts, not standalone Python:

```bash
blender --background --python scripts/blender-probes/inspect_materials.py
```

## Path dependencies (edit before re-running)

All four scripts contain hardcoded absolute paths to:
- `C:\Users\kyle\MPS\WellFi\wellfi-marketing\public\models\wellfi-sideclamp.glb` (model input — should still exist; check first)
- `C:\Users\kyle\MPS\WellFi\tmp\orientation\` and `C:\Users\kyle\MPS\WellFi\tmp\yaw_probe\` (output dirs in the parent's scratch — these directories were cleaned up; recreate or change OUTDIR before running)

If you re-run these on a different machine, edit the path constants at the top of each script.

## Refactor note

A future cleanup could replace the absolute paths with `pathlib.Path(__file__).resolve().parent.parent.parent / "public" / "models" / "wellfi-sideclamp.glb"` and a configurable `OUTDIR` env var. Not done yet because the scripts are one-shots; refactor only if they get reused.
