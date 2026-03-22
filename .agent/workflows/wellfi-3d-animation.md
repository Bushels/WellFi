---
description: Lessons learned from implementing the WellFi 3D particle morph animation
---

# WellFi 3D Animation - Lessons Learned

> **2026-03-21 override:** This older particle-morph workflow is not the pattern to reuse for the current hero. The new lesson is simpler: still-frame parity with the approved marketing render must be achieved before any complex animation idea is allowed to continue.

This workflow documents the attempts, successes, and failures of implementing a scroll-driven particle morph animation for the WellFi marketing site.

## Project Goal

Create a premium scroll-driven animation where:

1. The **WellFi logo** displays prominently
2. On scroll, the logo **dissipates into a particle cloud**
3. The particles **reassemble into the WellFi tool** (3D gauge model)
4. The solid 3D tool fades in for interactive exploration

---

## What Was Attempted

### Approach 1: Particle-Based Logo Representation

- Loaded the SVG logo using `SVGLoader` from three-stdlib
- Converted SVG paths to `ShapeGeometry`
- Sampled 12,000 points from the geometry using vertex-based barycentric sampling
- Rendered particles using `THREE.Points` with custom shaders
- Used GSAP ScrollTrigger to control the morph progress

### Approach 2: 3D Tool Integration

- Loaded `wellfi-gauge.glb` using `useGLTF`
- Sampled surface points using `MeshSurfaceSampler`
- Attempted to morph particles from logo positions to tool positions

---

## What Worked ✅

1. **SVG Path Loading**: The `SVGLoader` successfully parsed the logo SVG
2. **Path Filtering**: Logic to skip decorative elements (tiny circles, stroke-only paths) worked
3. **Area-Weighted Sampling**: Triangle area-based sampling prevented clustering
4. **Simplex Noise**: The noise function created organic-looking dispersion
5. **2-Stage Morph Logic**: The shader correctly split animation into scatter/assemble phases
6. **GSAP ScrollTrigger**: The pinning and scrub mechanics functioned properly

---

## What Failed ❌

### 1. Logo Readability

**Problem**: The particle representation of the logo was illegible - just scattered dots instead of clear "WellFi" text.

**Root Cause**:

- 12,000 particles spread across SVG paths don't have the visual density to form readable text
- Particles are uniform size and color - no edge definition
- The network lines (connecting particles) didn't enhance readability

**Lesson**: Particles work for abstract shapes, NOT for text/branding. Text requires crisp edges.

### 2. 3D Tool Not Rendering

**Problem**: Instead of the WellFi gauge, an "unfocused city" appeared (the HDRI environment map).

**Root Cause**:

- The tool mesh's material was set to `opacity: 0` and `visible: false` initially
- The fade-in logic (`if progress > 0.85`) may not have triggered correctly
- Potential WebGL context issues from multiple Canvas components earlier in development
- The environment map (`studio` from Drei) rendered behind transparent/invisible meshes

**Lesson**: Always verify 3D model visibility independently before integrating into complex animations.

### 3. Transition Quality

**Problem**: The morph felt like a simple "fade" rather than a premium transformation.

**Root Cause**:

- Particles all move at the same rate (no stagger/delay per particle)
- No secondary motion (rotation, trails, sparks)
- The "cloud" state was too chaotic to feel intentional

**Lesson**: Premium transitions need layered effects: primary motion + secondary motion + post-effects (bloom, trails).

---

## Technical Debt & Bugs Encountered

| Issue                               | Location                   | Status                       |
| ----------------------------------- | -------------------------- | ---------------------------- |
| `THREE.WebGLRenderer: Context Lost` | Multiple Canvas components | Fixed by removing one Canvas |
| `NaN` in `computeBoundingSphere()`  | Geometry sampling          | Fixed with validation checks |
| TypeScript `userData` on ShapePath  | SVGLoader types            | Fixed with `as any` cast     |
| Tailwind class warnings             | ProductExplorerSection     | Not fixed (cosmetic)         |

---

## Recommendations for Future Attempts

### Option A: Hybrid SVG + 3D Approach

- **Keep the logo as a clean SVG/image** for the initial state
- Use particles ONLY for the **transition effect** (explode outward)
- Load the 3D tool separately and fade it in
- This separates "branding" from "effects"

### Option B: Video/Lottie Animation

- Pre-render the logo-to-tool morph in After Effects or Blender
- Export as Lottie JSON or optimized video
- Use scroll position to scrub the video/Lottie
- Guarantees visual quality, reduces runtime complexity

### Option C: Refined Particle Approach

If particles must be used:

- Use 50,000+ particles for text density
- Add GPU instancing for performance
- Implement edge detection to concentrate particles on letter outlines
- Add bloom/glow post-processing for premium feel
- Stagger particle animation based on position

---

## Key Files Modified

- `src/components/three/ParticleMorphHero.tsx` - Main animation component
- `src/components/three/HeroScene.tsx` - Canvas setup
- `src/components/three/WellFiTool.tsx` - 3D model loader
- `public/wellfi-logo.svg` - Source logo
- `public/models/wellfi-gauge.glb` - 3D tool model

---

## Commands

```bash
# Run development server
npm run dev

# Check for TypeScript errors
npm run lint

# Build for production (will fail if type errors exist)
npm run build
```

---

## Next Steps Checklist

- [ ] Verify 3D tool renders independently (without particle system)
- [ ] Decide on approach: Hybrid (A), Video (B), or Refined Particles (C)
- [ ] If particles: Increase count significantly, add post-processing
- [ ] If video: Create After Effects composition, export Lottie
- [ ] Test on mobile devices for performance
