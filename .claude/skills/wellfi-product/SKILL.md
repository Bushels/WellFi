---
name: wellfi-product
description: WellFi wireless downhole monitoring system product knowledge. Use when writing content, creating diagrams, or implementing features that reference WellFi specifications, components, or technology.
---

# WellFi Product Knowledge

## When to Use
- Writing marketing copy about WellFi
- Creating technical diagrams
- Implementing specification displays
- Answering questions about the product
- Creating accurate visual representations

## Brand

### Name
**WellFi** (one word, capital W and F)

### Tagline
"Wireless Below. Insight Above."

### Distributor
MPS Group (mpsgroup.ca) - Canadian distributor
Note: Reslink is the manufacturer (Australia), NOT the brand for North American marketing.

### Logo Colors
- Navy: #1a365d
- Cyan: #22d3ee
- WiFi symbol integrated

## Core Value Proposition

Real-time downhole monitoring system that transmits pressure and temperature data **wirelessly through steel casing** using electromagnetic telemetry.

**Key differentiator:** Works where competitors fail — through metal casing.

## Technical Specifications

### Downhole Gauge (RES-01-003A)

| Parameter | Value |
|-----------|-------|
| Temperature Rating | 302°F (150°C) |
| Pressure Rating | 10,000 psia |
| Battery Life | 5+ years |
| Outer Diameter | 1.83" (46mm) |
| Pressure Resolution (Piezo) | 0.04 psi |
| Pressure Resolution (Quartz) | 0.006 psi |
| Data Output | MODBUS RS-485 |
| Optional Output | 4-20mA |

### Surface Box

| Parameter | Value |
|-----------|-------|
| Memory | 7,768 events onboard |
| Connection | USB-B for local PC |
| Output | MODBUS RS-485 to RTU/SCADA |
| Detection | BNC cables to wellhead + antenna stake |

### Battery Options
| Capacity | Typical Use Case |
|----------|------------------|
| 17 Ah | Standard deployments |
| 34 Ah | Extended life |
| 51 Ah | Maximum duration |

## Physical Assembly (Tubing Attachment - RES-01-003A)

**From Top to Bottom:**

1. **Top Clamp**
   - Interference fit to pup joint
   - Requires wire-wheeled bare steel contact
   - Slides over during makeup

2. **Signal Collar Adapter**
   - Creates electrical connection to tubing
   - Critical for EM signal transmission

3. **Electronics Sonde**
   - Contains sensors (pressure, temperature)
   - Contains EM transmitter
   - The "brain" of the system

4. **Battery Barrel(s)**
   - Modular design (stack for more capacity)
   - Factory sealed

5. **PEEK Clamp**
   - Mid-span support
   - Vibration dampening
   - Protects electronics from mechanical stress

6. **Fiberglass Collar**
   - 6.25" length
   - STAR 2-3/8" 8RD EUE, 2000#
   - **CRITICAL: Creates electrical isolation**
   - Forces signal through formation, not short-circuit through steel
   - **Visual appearance:** Olive-tan color (NOT teal/green). Visually distinct from the stainless steel sections.
   - **In renders:** Base color (0.30, 0.25, 0.10), non-metallic, roughness 0.4, IOR 1.54

7. **Bottom Clamp**
   - Interference fit to second pup joint
   - Completes mechanical assembly

### Assembly Requirements
- Two pup joints: minimum 10ft each (2-3/8" EUE)
- Contact points must be wire-wheeled to bare steel
- Total assembly length: approximately 25-30ft

## How EM Telemetry Works

### Signal Path
1. Electronics Sonde generates low-frequency EM signal (1-10 Hz)
2. Signal Collar creates electrical contact with Pup Joint #1
3. **Fiberglass collar creates electrical isolation** (key innovation)
4. Signal forced to travel through formation (not short-circuit through continuous steel)
5. Signal propagates up through casing/tubing and earth
6. Surface Box detects voltage differential between wellhead connection and ground stake
7. Ground stake positioned minimum 10 meters from wellhead

### Why This Works
Traditional EM telemetry fails in cased wells because metal's low resistivity and high magnetic permeability absorb 99.9%+ of signal. WellFi's approach creates a circulation loop between transmitter and casing using two electrical connectors (top and bottom of gauge) separated by the fiberglass collar.

## DeltaPressure Feature

### How It Works
- **Continuous monitoring** at high frequency (e.g., every 10 minutes)
- **Scheduled transmission** at battery-conserving interval (e.g., every 8 hours)
- **Exception-based alerting** when readings exceed thresholds

### Example Configuration
- Set point: 1500 kPa(a)
- Threshold: ±150 kPa
- Alert triggers if: <1350 kPa OR >1650 kPa
- Alert is immediate, regardless of scheduled interval

### Value Proposition
"Always watching, only talking when it matters" — surveillance without battery sacrifice.

## Installation Context

### Where It Goes
- Attached to outside of production tubing
- Below slotted pup joint
- Above no-turn tool
- In PCP (Progressive Cavity Pump) completions

### When to Install
- **Ideal:** During pump changeout/workover (pump already being pulled)
- **Also:** New completions, retrofit existing wells

### Installation Time
- Adds minutes, not hours, to workover
- No cable strapping required
- Standard EUE connections

### Surface Installation
- Surface Box installed at wellhead
- One BNC cable to wellhead connection
- One BNC cable to stainless steel antenna stake
- Stake positioned 10+ meters from wellhead

## Target Market

### Primary Applications
- Cold production in Canadian oilsands
- PCP pump operations
- Heavy oil wells

### Target Formations
- Clearwater
- Blue Sky
- Grand Rapids

### Target Buyers
- Completions engineers
- Production engineers
- Operations teams at heavy oil operators

### Entry Point
Pump changeouts — when the pump fails and needs replacement, WellFi can be added with minimal additional rig time.

## Competitive Position

### vs. Wired Gauges
- No cable strapping down entire wellbore
- No cable failure risk
- Faster installation
- Easier servicing

### vs. Fiber Optic
- Significant cost savings
- Simpler installation
- Sufficient accuracy for most applications

### vs. No Monitoring
- Prevent pump burnout (head management)
- Production optimization
- Reduced unexpected downtime
- Proactive vs. reactive operations

## Proof Points (Use Carefully)

### What We Can Say
- "130+ installs and counting"
- "Zero tool failures to date"
- "Operators report improved optimization"

### What We Cannot Say
- Specific customer names without permission
- Specific percentage claims without attribution
- Competitor comparisons with specific pricing

## Messaging Principles

### Do
- Use industry terminology correctly (MODBUS, RTU, SCADA, PCP)
- Lead with benefits (reliability, simplicity, integration)
- Let engineers draw their own conclusions
- Emphasize "wireless through steel"

### Don't
- Use marketing fluff
- Oversimplify the technology
- Make claims without backing
- Mention Shell without explicit permission

## Visual Representation (Renders & Photography)

### Hero Image Requirements
- **Background:** Pure black (0,0,0) — hero section starts `bg-black`, GSAP transitions to navy at 0.9s
- **Composition:** Tool crosses frame diagonally (lower-left to upper-right)
- **Negative space:** Upper-left (desktop) for headline overlay; top (mobile) for headline
- **Key features visible:** Multiple coupling transitions showing diameter changes
- **Tool appearance:** Rich stainless steel with anisotropic reflections, not flat/matte

### What Makes the Tool Visually Recognizable
The coupling sections where different tool components connect show **dramatic diameter changes** (24mm to 46mm — nearly 2x). These create the visible "bumps" that distinguish the WellFi tool from a generic rod. The fiberglass collar (olive-tan) provides a color break from the stainless steel.

### Assembly Threading
- All connections are **flush threaded** (no protruding collars)
- Visual transitions come from diameter changes at coupling zones, not from external collar geometry

### Reference Images
- `public/images/wellfi-hero-4k.webp` — Desktop hero (3840x2160)
- `public/images/wellfi-hero-mobile.webp` — Mobile hero (1080x1920)
- `blender/wellfi_hero_final.blend` — Blender production scene

### CAD Source Files
- `wellfi-dwg/model.glb` — GLB model (most reliable import)
- `wellfi-dwg/WellFi_Assembly_real.stl` — Full STL assembly
- `wellfi-dwg/parts/` — Individual part STLs (14 files, some duplicates)

## Content Writing Guidelines

### Section Messaging Reference

| Section | Message |
|---------|---------|
| Hero | Wireless Below. Insight Above. |
| Benefits | Reliable. Simple. Powerful. |
| Technology | Electromagnetic Telemetry — The New Standard |
| Product | Modular Design. Engineered Integrity. |
| Installation | Quicker Install. No Strings Attached. |
| Integration | Plug and Play |
| Intelligence | Deploy and Forget. We'll Alert You. |
| Results | Less Downtime. Fewer Workovers. Optimized Production. |
| CTA | Become Wireless |
