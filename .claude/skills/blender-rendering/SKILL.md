---
name: blender-rendering
description: Blender MCP rendering techniques for WellFi product photography. Use when creating hero images, product renders, or marketing stills using Blender via MCP. Covers scene setup, materials, lighting, camera framing, and export workflows.
---

# Blender MCP Product Rendering

## When to Use
- Creating hero images or marketing stills for the WellFi website
- Setting up product photography scenes in Blender via MCP
- Troubleshooting render quality (materials, lighting, composition)
- Exporting renders for web (WebP optimization)

## Scene Files

| File | Purpose |
|------|---------|
| `blender/wellfi_hero_final.blend` | Current production scene (save here) |
| `blender/wellfi_hero_setup.blend` | Original scene from first session (backup) |
| `wellfi-dwg/model.glb` | GLB model (738K verts, imports cleanly) |
| `wellfi-dwg/WellFi_Assembly_real.stl` | STL assembly (374K tris, binary STL) |

### CAD File Gotchas
- `1_83Inch_Tx_ToolUnibody_StepFile.STL` — **NOT an STL!** It's a STEP file (ISO-10303-21) with wrong extension. Blender cannot import it.
- `wellfi-dwg/parts/WellFi_Assembly_complete.stl` — May fail to open from subdirectory. Use `WellFi_Assembly_real.stl` from parent directory instead.
- GLB import (`model.glb`) is the most reliable path. Use `bpy.ops.import_scene.gltf()`.

## Scene Architecture (mm Scale)

The scene operates in **millimeters**, not meters. This affects light energy values dramatically.

### Object Hierarchy
```
WellFi_Complete_Assembly (Empty — rotation/position parent)
├── Battery_Barrel_Group (Empty)
│   └── WellFi_Gauge_Assembly (122K verts, 246K faces — main tube)
├── Signal_Unit_Group (Empty)
│   └── WellFi_Body_Upper (256 verts — upper collar ring)
├── WellFi_Body_Lower (256 verts — lower collar ring)
├── WellFi_Fiberglass_Collar (256 verts — olive-tan insulating collar)
├── WellFi_Junction_Ring (256 verts — steel ring near fiberglass)
└── WellFi_Logo_Text (1820 verts — engraved logo)
```

### Critical: Mesh Geometry Distribution
The main `WellFi_Gauge_Assembly` mesh has a **2171mm empty gap** in the middle:
- **Bottom coupling zone** (local Z = -2453 to -2225): Dense geometry with dramatic diameter changes (12mm→23mm radius). This is where the couplings are.
- **Top coupling** (local Z = -54 to +15): Single coupling section.
- **Middle** (Z = -2225 to -54): NO vertex detail. Just smooth cylinder walls spanning the gap.

The separate ring objects (Body_Lower, Body_Upper, Fiberglass_Collar, Junction_Ring) provide additional visual features at different positions along the smooth mid-section.

### Coupling Zone Anatomy (The Money Shot)
The bottom coupling zone has the most visual interest:
```
Z = -2453: Bottom tip/end cap (r=17-19mm)
Z = -2418: COUPLING #1 (r=23.3mm) ← widest, dramatic step
Z = -2380: Narrow tube (r=12.5mm) ← half the coupling diameter!
Z = -2362: Wide section (r=20.3mm)
Z = -2309: COUPLING #2 (r=23.3mm) ← second major coupling
Z = -2247: Section transition
Z = -2225: End of coupling zone
```

The radius changes from 12mm to 23mm (nearly 2x) create the prominent "coupling bumps" visible in the hero.

## Camera Framing — The #1 Lesson

### DO: Frame the coupling zone from the SIDE
The camera must be positioned **perpendicular to the tool axis** to see diameter changes as prominent surface bumps. Side views reveal the 12mm→23mm transitions dramatically.

### DON'T: Frame end-on or full-tool views
- **End-on view**: Looking down the tool axis makes the tip dominate and couplings invisible.
- **Full-tool view**: The 2468mm tool at any distance that fits the frame makes coupling details microscopic. The tool looks like a featureless silver rod.

### Desktop Hero Composition (What Works)
```python
# Assembly rotation: 60° X tilt (creates ~30° diagonal matching 16:9 frame diagonal)
assembly.rotation_euler = (math.radians(60), 0, 0)

# Camera to the SIDE (-X) of the coupling zone, slightly forward
# This is a 3/4 side view showing diameter changes as surface features
frame_center = <coupling zone world center>
cam.location = (frame_center.x - 400, frame_center.y - 200, frame_center.z + 30)

# 85mm telephoto for product photography compression
cam.data.lens = 85
cam.data.shift_x = 0.06  # Pushes tool to RIGHT, negative space on LEFT for headline
```

### Mobile Hero Composition
```python
# Same camera angle but with portrait framing
mob.data.lens = 80
mob.data.shift_y = 0.15  # Pushes tool DOWN, black space ABOVE for headline
```

### Diagonal Direction
- **Correct**: Lower-left to upper-right (matches existing hero, reads naturally)
- Camera on **-X side** creates this direction with positive X rotation
- Camera on **+X side** creates the reverse (lower-right to upper-left) — can be fixed by horizontal flip but loses compositional control

### How to Find Coupling Zone in World Space
```python
mesh_obj = bpy.data.objects['WellFi_Gauge_Assembly']
bpy.context.view_layer.update()  # CRITICAL after rotation changes!

coup1_world = mesh_obj.matrix_world @ Vector((0, 0, -2418))
coup2_world = mesh_obj.matrix_world @ Vector((0, 0, -2309))
frame_center = (coup1_world + coup2_world) / 2
```

**Always call `bpy.context.view_layer.update()`** after changing assembly rotation — otherwise `matrix_world` returns stale values.

## Materials

### Stainless Steel (WellFi_Steel)
```python
# Principled BSDF settings for industrial stainless steel
metallic = 1.0
roughness = 0.18          # Smooth but not mirror
anisotropic = 0.6         # Directional reflections along tool axis
anisotropic_rotation = 0.0
specular_ior_level = 0.5
base_color = (0.55, 0.54, 0.52, 1)  # Warm silver
```

### Fiberglass Collar (WellFi_Teal_Fiberglass)
```python
# Olive-tan non-metallic (NOT teal — user explicitly corrected this)
metallic = 0.0
roughness = 0.4
ior = 1.54               # Glass fiber composite
subsurface_weight = 0.05  # Subtle translucency
base_color = (0.30, 0.25, 0.10, 1)  # Olive-tan
```

### Fiberglass Face Assignment
The original scene had all 246K faces assigned to Steel. To assign fiberglass to the correct region, scan mesh vertices by local Z coordinate and assign faces within the fiberglass collar zone.

## Lighting (5-Light Product Photography Rig)

All lights are Area lights (RECTANGLE shape). Energy values are in the **100kW+ range** because the scene is in millimeters.

### Light Positions (Relative to Coupling Zone Center)
```python
zc = frame_center  # Coupling zone world center

# Key: Front-side, creates main illumination gradient
Hero_Key.location = (zc.x - 350, zc.y - 200, zc.z + 200)
Hero_Key.energy = 150000  # 150kW
Hero_Key.size = 800       # Wide softbox along tool axis
Hero_Key.size_y = 150     # Narrow across

# Rim 1: Back-opposite side, sharp specular edge
Hero_Rim.location = (zc.x + 250, zc.y + 100, zc.z + 50)
Hero_Rim.energy = 400000  # 400kW (strongest light)
Hero_Rim.size = 800
Hero_Rim.size_y = 40      # VERY narrow = sharp edge highlight

# Rim 2: Below-back, fills shadow side
Hero_Rim_2.location = (zc.x + 200, zc.y + 80, zc.z - 200)
Hero_Rim_2.energy = 200000
Hero_Rim_2.size = 600
Hero_Rim_2.size_y = 80

# Cyan Accent: Subtle EM-signal blue wash
Hero_Cyan_Accent.location = (zc.x - 150, zc.y - 100, zc.z + 40)
Hero_Cyan_Accent.energy = 30000
# Color: cyan (0.06, 0.71, 0.83)

# Fill: Very low, preserves shadow contrast
Hero_BG_Fill.location = (zc.x - 100, zc.y - 200, zc.z - 80)
Hero_BG_Fill.energy = 5000  # Intentionally weak
```

### Lighting Principles for Metallic Tubes
1. **Narrow rectangle lights** create sharp specular edges on cylindrical surfaces — this is what makes it look like polished steel
2. **Low fill light** preserves the dark-side gradient that gives the cylinder its 3D form
3. **Rim lights on the opposite side from key** define the tool's silhouette against the black background
4. When mirroring the camera side (e.g., +X to -X), **mirror ALL light X positions** to preserve the same lighting quality

## Background

### Pure Black (Not Navy!)
The hero section starts with `bg-black` and GSAP transitions to `#0A0E1A` at 0.9s. The render background MUST be pure black (0, 0, 0) for seamless blending.

### HDRI for Reflections Only (Light Path Trick)
```python
# World shader: HDRI visible to reflections, black to camera
# Use Light Path > Is Camera Ray to switch:
# Camera Ray = True → black background
# Camera Ray = False → HDRI (for metallic reflections)
```

## Render Settings

### Cycles + AgX
```python
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.display_settings.display_device = 'sRGB'
scene.view_settings.view_transform = 'AgX'       # NOT Filmic
scene.view_settings.look = 'High Contrast'        # Punchy metallic highlights
scene.sequencer_colorspace_settings.name = 'AgX Base sRGB'
```

### Quality Tiers
| Tier | Samples | Adaptive | Use Case |
|------|---------|----------|----------|
| Quick preview | 128 | 0.05 | Composition checks (50% resolution) |
| Stage 1 preview | 256-512 | 0.01 | Quality approval (100% at 1080p) |
| Final 4K | 512 | 0.01 | Production render with OIDN denoiser |

### MCP Timeout Workaround
The Blender MCP connection times out on renders longer than ~2 minutes. For 4K (3840x2160):

1. Save the scene with render settings baked in
2. Render via **Blender CLI** through Bash:
```bash
"/c/Program Files/Blender Foundation/Blender 4.4/blender.exe" \
  -b "path/to/scene.blend" \
  -o "path/to/output" \
  -f 1 -- --cycles-device CUDA
```
3. Run in background with `run_in_background: true` and 600s timeout

### Denoiser
Always use **OpenImageDenoise (OIDN)** — it's the best quality denoiser in Blender, especially for metallic surfaces. With OIDN, 256-512 samples produces results comparable to 2048 samples without denoising.

## Export for Web

### WebP Conversion (Python in Blender)
```python
import subprocess
# After rendering PNG, convert to WebP
subprocess.run([
    'cwebp', '-q', '85', '-m', '6',
    'FINAL_DESKTOP_4K.png',
    '-o', 'wellfi-hero-4k.webp'
])
```

### If cwebp Not Available
Use Python Pillow or Blender's compositor to output directly. Or export PNG and convert with any image tool.

### Target File Sizes
| Image | Resolution | Target Size |
|-------|-----------|-------------|
| Desktop hero | 3840x2160 | <100KB WebP |
| Mobile hero | 1080x1920 | <20KB WebP |

The images are mostly black background with a metallic tool, so WebP compresses extremely well.

## Workflow Summary

1. **Open** `wellfi_hero_final.blend`
2. **Set** assembly rotation (60° X for desktop diagonal)
3. **Call** `view_layer.update()` to refresh transforms
4. **Compute** coupling zone world center from mesh vertex positions
5. **Position** camera perpendicular to tool axis, aimed at coupling zone
6. **Position** all 5 lights relative to coupling zone center
7. **Preview** at 50% resolution, 128 samples
8. **Iterate** camera/lights until composition matches reference
9. **Render** Stage 1 at 1080p, 512 samples for approval
10. **Render** Stage 2 at 4K via Blender CLI (MCP times out)
11. **Export** as WebP, replace files in `public/images/`

## Common Mistakes to Avoid

1. **Forgetting `view_layer.update()`** after rotation changes — matrix_world gives stale coordinates
2. **Looking down the tool axis** (end-on view) — coupling bumps become invisible
3. **Framing the full 2.4m tool** — mid-section is featureless smooth tube
4. **Navy background** — must be pure black (0,0,0) to match hero's `bg-black` start
5. **Teal fiberglass** — user explicitly wants olive-tan (0.30, 0.25, 0.10)
6. **Even/flat lighting** — creates "glowstick" effect. Need high contrast with narrow rim lights
7. **High fill light** — kills the shadow gradient that gives the cylinder its 3D metallic look
8. **Trying 4K renders through MCP** — always times out. Use Blender CLI via Bash instead
