# WellFi Hero: "Stop Pumping Blind" Motion Poster

> **2026-03-21 Retrospective Override:** The status/approach block immediately below this note is partially outdated. The final working direction for this portion of the marketing is **not** "raw GLB hero truth." The correct pivot was: keep the approved side-clamped render as the visual source of truth, stay in a black-only visual system, and use R3F only as an exact-match animation container for the sweep and telemetry pulse.

## 0. Session Retrospective: Lessons Learned, Pivot Path, and Self-Rating

### What went wrong
- The hero drifted away from the actual brief more than once. The biggest misses were the white-background phase, the wrong "drop-in" visual language, and overdesigned intro transitions that did not match the approved installed-state marketing image.
- The raw 3D path was over-trusted. The side-clamp GLB looked promising because it loaded in R3F, but it was still only one preview-material mesh. That made it impossible to match the approved render perfectly without more technical art work.
- Too many early decisions optimized for "cinematic" instead of "exact." That produced motion and lighting ideas before the base visual truth was locked.

### What we pivoted away from
1. **Blender assembly from separate STEP files**
   The assembly lacked reliable constraints and produced bad geometry/positioning after repeated attempts.
2. **Merged assembly + raw GLB as the hero truth**
   This removed some CAD pain, but still failed the visual brief because the material separation was not real enough for a perfect hero match.
3. **Dark-to-light / black-to-white intro concept**
   This was directionally wrong for the stainless-on-black brief and weakened the metal sweep.

### What we pivoted toward
1. **Approved render as source of truth**
   The validated side-clamp render became the one image the hero had to match exactly.
2. **Black-only visual system**
   The hero stayed in one dark world instead of changing visual systems mid-sequence.
3. **R3F as an animation container, not as fake 3D truth**
   The approved render was staged inside R3F as a texture card, then the slow sweep and telemetry pulse were animated in WebGL on top of that exact image.

### Pitfalls to avoid next time
- Do not let a technically available GLB outrank an approved marketing render.
- Do not introduce a white world, flash handoff, or extra visual system when the brief says black industrial restraint.
- Do not claim "perfect match" from a single-material preview mesh. That is a technical art problem, not a hero-code problem.
- Do not add motion beats until the still frame already matches the approved reference.

### Session self-rating
- **Overall session alignment to the brief:** `5.5 / 10`
- **Why not higher:** the early passes were materially off-brief and repeated the same type of drift the user was already unhappy with.
- **Where it recovered:** the final direction moved much closer by locking the black background, the approved installed-state render, and the exact-match R3F card strategy.
- **Final-state alignment after the pivot:** approximately `8 / 10`

### Direct instruction fidelity summary
- The user was right to push back hard on the early hero work.
- The clearest instruction for this portion of the marketing was: exact side-clamped installed-state visual, black background, slow sweep, minimal copy clutter, and no conceptual drift.
- The final implementation is much closer to that instruction set than the first half of the session was.

**Date:** 2026-03-20 (updated same day)
**Status:** Approved — pivoted from Blender to R3F for tool rendering
**Replaces:** 2026-03-18-hero-from-dark-to-light-design.md, 2026-03-18-cinematic-hero-intro-design.md (deleted)
**Approach:** R3F procedural side-clamp model + cinematic lighting + GSAP timeline
**Difficulty:** 7/10

> **Pivot note (2026-03-20):** The Blender approach failed because the 5 individual STEP files lack assembly constraints — we couldn't position the clamp parts correctly relative to each other after 10+ render iterations. A merged assembly STEP also produced incorrect geometry. Pivoting to R3F where we can iterate on positioning in real-time with hot reload. The motion poster concept, timing, copy, and animation architecture remain unchanged — only the rendering technology changes. See `memory/feedback_blender_assembly.md` for full lessons learned.

---

## 1. Concept

A **4-second motion poster** — mostly still, one controlled animation sequence on page load. Not a cinematic CGI spot. Not a browser demo. A single moment of restraint that hits hard.

**Narrative arc:** Darkness → Metal revealed by light → EM pulse brings information → Message lands

**Creative pillars:**
- Subtle hardware reveal. Aggressive typographic reveal.
- The tool reveal stays restrained — the blue EM pulse does the storytelling
- "STOP PUMPING BLIND" hits hard
- Blue is the **only** accent color in the entire frame

**What changed from previous design (March 18):**
- Side clamp assembly replaces internal-mount cylinder (CNC-machined clamp windows = dramatic light catches)
- Tool oriented **vertically** — pipe runs off top/bottom of frame, only 30-40% visible
- No threading animation — simpler, more aggressive
- Blue EM pulse reveals the text (not a separate signal ring + separate text fade)
- Tool never fully disappears — fades to ghost silhouette behind text
- Green signal collar suppressed in shadow — blue owns the accent role

---

## 2. Copy

| Element | Text | Timing |
|---------|------|--------|
| Headline | **Stop Pumping Blind.** | 1.5–2.2s (revealed by pulse) |
| Supporting | Real-time pressure. Through casing. No wireline. | 3.0–4.0s (settle phase) |
| Proof chips | Install on changeout · 130+ installed · Observed production uplift | 3.0–4.0s |
| Primary CTA | Talk to MPS Group | 3.0–4.0s |
| Secondary CTA | See the Tool | 3.0–4.0s |
| Logo | WellFi wordmark, bottom-right | 2.2–3.0s |

**Copy NOT in the teaser moment:** No sub-copy competes with the headline. Supporting text, proof chips, and CTAs appear only after the hold.

---

## 3. The 4-Second Sequence

### Beat 0: Darkness (0.0–0.5s)
- Full black screen
- No content, no hints
- Purpose: tension through absence

### Beat 1: Metal Sweep (0.5–1.1s)
- Narrow spotlight sweeps left-to-right across the upright tool
- Just enough stainless sheen to read shape, not details
- The CNC-machined clamp windows catch the light — this is the money geometry
- Feel: "Something industrial is here."
- **Tech:** GSAP-animated CSS gradient mask over Blender-rendered WebP

### Beat 2: EM Pulse (1.1–1.5s)
- One tight blue pulse (#22D3EE) leaves the signal section
- Travels upward along the tool body
- Controlled, not sci-fi — like a sonar ping, not a lightning bolt
- Feel: "It's transmitting."
- **Tech:** GSAP + SVG circle with feGaussianBlur bloom filter, MotionPathPlugin

### Beat 3: Text Reveal (1.5–2.2s)
- The pulse's leading edge reveals "STOP PUMPING BLIND"
- Text appears to emerge from the pulse itself — clip-path synced to pulse Y-position
- Large display type, aggressive weight
- Feel: Gut punch.
- **Tech:** GSAP clip-path animation synced to pulse position

### Beat 4: Ghost + Logo (2.2–3.0s)
- Tool fades to ~15% opacity ghost silhouette behind the text
- Product connection preserved — the silhouette is always present
- WellFi logo appears bottom-right
- Feel: The product and message coexist.
- **Tech:** GSAP opacity tweens

### Beat 5: Settle (3.0–4.0s)
- One soft blue pulse through the WellFi logo (single, not repeating)
- Supporting copy, proof chips, and CTAs fade in with stagger
- Desktop: subtle mouse parallax activates on tool ghost (±12px)
- Hold. Page is now in normal browsing state.
- **Tech:** SVG pulse ring on logo + GSAP stagger reveals

---

## 4. R3F Tool Rendering (Pivoted from Blender)

### Model Source
- `public/models/wellfi-sideclamp.glb` — Draco-compressed GLB (869 KB) exported from merged assembly STL
- Original STLs from FreeCAD conversion: `wellfi-dwg/Side Clamp/stl/*.stl`
- If the GLB assembly is insufficient, build the tool procedurally in R3F from simple Three.js geometry (cylinders + imported clamp meshes)

### Procedural Fallback Geometry
If the GLB doesn't look right, build from primitives:
- **Production tubing:** CylinderGeometry, 60.3mm OD, dark matte material (#0A0A0A, roughness 0.9)
- **Battery barrels + sonde:** CylinderGeometry, 46mm OD, stainless steel material
- **Clamp sections:** Import individual clamp STLs for oval window detail, or approximate with BoxGeometry + CSG
- **Signal collar:** Small cylinder, suppressed dark material

### Composition
- Tool oriented **vertically** — pipe axis runs top-to-bottom
- Foreshortened camera angle (~10-15 degrees off vertical)
- Background: `#020610` (near-black with slight blue)
- Fog for depth: same color, near=6, far=14

### Materials (MeshPhysicalMaterial)
```
WellFi Steel:
  color:              #D8E4EE  (cool stainless)
  roughness:          0.14
  metalness:          0.97
  clearcoat:          1.0
  clearcoatRoughness: 0.06
  envMapIntensity:    animated 0→1.7 during reveal
  emissive:           #66EFFF  (subtle cyan)
  emissiveIntensity:  animated 0→0.02

Dark Pipe:
  color:              #0A0A0A
  roughness:          0.9
  metalness:          0.1

Environment: "warehouse" preset (industrial reflections)
```

### Lighting Rig (7 lights, animated staggered reveal)
Uses the existing `HeroCinematicCanvas.tsx` lighting architecture:

| # | Type | Color | Target Intensity | Fade Start | Role |
|---|------|-------|-----------------|------------|------|
| 1 | Spot (rim) | #E8F4FF | 1.6 | 0.0s | Cold edge catch — first visible |
| 2 | Ambient | #FFFFFF | 0.22 | 0.15s | Minimum fill |
| 3 | Directional (key) | #F7FBFF | 2.4 | 0.2s | Main illumination |
| 4 | Directional (fill) | #6DF2FF | 1.0 | 0.3s | Cyan industrial fill |
| 5 | Spot (top) | #EFFBFF | 1.2 | 0.35s | Specular highlight |
| 6 | Spot (accent) | #67F4FF | 0.7 | 0.4s | Cyan rim accent |
| 7 | Spot (barrel) | #FFFFFF | 0.9 | 0.25s | Long specular parallel to body |

### Post-Processing
```
EffectComposer:
  Bloom: intensity 0.4 (mobile: 0.15), threshold 0.85, mipmapBlur
  N8AO (SSAO): radius 0.06, intensity 0.65, halfRes (desktop only)
  DepthOfField: focalLength 0.025 (mobile: 0.015), bokehScale 4.5
  Vignette: offset 0.25, darkness 0.7 (mobile: 0.55)
```

### Why R3F Over Blender
- Real-time iteration on assembly positioning
- Hot reload — see changes instantly
- Existing infrastructure: `HeroCinematicCanvas.tsx` has lighting, camera, signal ring, post-processing
- The signal ring animation runs natively in the same scene (no SVG overlay needed)
- Bundle cost already paid (three, @react-three/fiber, drei, postprocessing in package.json)

---

## 5. Pulse Animation Architecture

### Layer Stack (bottom to top)

```
z-0  Background           CSS bg-black → bg-navy-void transition
z-1  Tool image            Blender WebP render (vertical side clamp)
z-2  Spotlight sweep       GSAP-animated CSS gradient mask
z-2  EM pulse              SVG circle + feGaussianBlur bloom filter
z-3  Gradient overlay      Left-to-right dark gradient for text readability
z-4  Text: headline        "STOP PUMPING BLIND" — clip-path revealed
z-5  Logo + support copy   Fade-in after ghost transition
z-10 Content overlay       Proof chips, CTAs, contact
```

### Spotlight Sweep (Beat 1)
```css
/* Gradient mask that slides across the tool */
.hero-light-sweep {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent
  );
  width: 35%;
}
/* GSAP: translateX(-100%) → translateX(300%) over 0.6s */
```

### EM Pulse (Beat 2)
```svg
<svg class="hero-pulse-svg">
  <defs>
    <filter id="pulse-bloom">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
      <feColorMatrix type="matrix"
        values="0 0 0 0 0.133
                0 0 0 0 0.827
                0 0 0 0 0.933
                0 0 0 1.5 0" />
      <feMerge>
        <feMergeNode />          <!-- bloom layer -->
        <feMergeNode in="SourceGraphic" /> <!-- sharp core -->
      </feMerge>
    </filter>
  </defs>
  <circle cx="50%" cy="0" r="6" fill="#22D3EE" filter="url(#pulse-bloom)" />
</svg>
```
- GSAP animates `cy` from bottom of tool to top over 0.4s
- Opacity: 0 → 0.8 → 0 with ease
- Single pass, no repeat

### Text Reveal (Beat 3)
```css
.hero-headline {
  clip-path: inset(100% 0 0 0);  /* fully hidden */
}
/* GSAP: clip-path → inset(0% 0 0 0) synced to pulse Y position */
```

### Logo Pulse (Beat 5)
```svg
<!-- Single expanding ring -->
<circle cx="50%" cy="50%" r="0" stroke="#22D3EE" stroke-width="1" fill="none"
        opacity="0.6" />
<!-- GSAP: r 0→40, opacity 0.6→0, duration 0.8s -->
```

---

## 6. File Architecture

### New Files
| File | Purpose |
|------|---------|
| `src/components/hero/WellFiSideClampModel.tsx` | Procedural side-clamp tool model for R3F |
| `public/models/wellfi-sideclamp.glb` | Draco-compressed GLB from merged assembly (869 KB) |

### Modified Files
| File | Change |
|------|--------|
| `src/components/hero/HeroCinematicCanvas.tsx` | Swap GLB model for side-clamp, adjust camera framing |
| `src/components/hero/HeroSection.tsx` | Wire R3F canvas into hero with GSAP timeline coordination |
| `src/lib/content.ts` | Verify hero copy matches (already correct) |
| `src/app/globals.css` | Add hero-specific keyframes if needed |

### Existing (reused)
| File | Role |
|------|------|
| `src/components/hero/SignalRing.tsx` | Traveling EM pulse ring — already built, works in R3F |
| `src/components/hero/EMPulse.tsx` | SVG pulse component — available as fallback if R3F signal ring insufficient |

### Archived (kept for reference)
| File | Reason |
|------|--------|
| `src/components/hero/HeroIntroCanvas.tsx` | Original R3F canvas, historical reference |

### Dependencies
- **No new npm packages** — all R3F deps already installed
- three, @react-three/fiber, @react-three/drei (already installed)
- @react-three/postprocessing (already installed)
- GSAP + @gsap/react (already installed)

---

## 7. Mobile & Reduced Motion

### Responsive Strategy
| Aspect | Desktop | Mobile (< 768px) |
|--------|---------|-------------------|
| Tool render | 3840x2160 | 1080x1920 |
| Spotlight sweep | 35% width gradient | Same, slightly narrower |
| Pulse bloom | stdDeviation="8" | stdDeviation="5" |
| Mouse parallax | Enabled, +/-12px | Disabled |
| Timing | Same 4s sequence | Same 4s sequence |
| Headline size | clamp(2.65rem, 5.2vw, 4.8rem) | Same clamp |
| Ghost opacity | 15% | 15% |

### Reduced Motion
If `prefers-reduced-motion: reduce`:
- Static tool image at 15% opacity (ghost state)
- All text visible immediately, no animation
- Signal pulse shown as static cyan glow dot at signal collar position
- No spotlight sweep, no clip-path reveal
- Background starts at navy-void, not black

---

## 8. What Will Kill the Impact

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| Sci-fi lightning beam | Looks like a video game, not industrial hardware |
| Showing full tool length | Loses mystery; displayed, not installed |
| Too much teaser copy | Dilutes the gut punch of one line |
| Fake futuristic dashboard | Engineers will reject it instantly |
| Fading logo too quickly | Feels rushed, not confident |
| Repeated pulsing on logo | Cheap animated-GIF energy |
| Green collar competing with blue | Split attention, weakened color story |
| CSS box-shadow for glow | Flat, no bloom depth — SVG filter required |

---

## 9. Success Criteria

1. An engineer immediately reads the tool as real CNC-machined downhole hardware
2. The spotlight sweep creates anticipation, not confusion
3. The blue pulse feels like EM telemetry — controlled, precise, not decorative
4. "Stop Pumping Blind." lands as a gut punch, not a tagline
5. The ghost silhouette maintains product connection throughout
6. Mobile first fold feels intentional and loads fast (< 100KB hero assets)
7. No WebGL required for the hero — pure CSS/GSAP/SVG/images
8. The page feels like a motion poster from a hardware company, not a SaaS landing page

---

## 10. R3F Implementation Workflow

1. Load GLB model or build procedural geometry for the side-clamp assembly
2. Create `WellFiSideClampModel.tsx` — positions tool vertically, applies stainless steel material
3. Add dark production tubing cylinder running through the scene
4. Adapt `HeroCinematicCanvas.tsx` to use new model + adjusted camera framing
5. Verify assembly looks correct in real-time via `npm run dev`
6. Tune lighting intensities and camera angle for dramatic reveal
7. Wire R3F canvas into `HeroSection.tsx` with GSAP timeline coordination
8. Test signal ring travel, bloom, and post-processing
9. Mobile performance check (DPR capping, SSAO disabled)

---

## 11. Future Considerations

- **R3F "See the Tool" section:** The side-clamp model from the hero canvas can be reused in an interactive below-the-fold explorer with user-controlled camera rotation.
- **Marketing video:** If a Blender render is needed for video (with sound design), the correct approach is to get a pre-assembled CAD file from engineering rather than assembling from individual parts.
- **A/B testing:** The ghost opacity (15%) and pulse color intensity can be tuned after launch based on engagement data.
- **GLB model upgrade:** If engineering provides a properly assembled STEP/IGES file of the full side-clamp assembly (with battery barrels and sonde), it can be converted to GLB and dropped into the R3F scene for higher fidelity.
