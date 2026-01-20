# WellFi Marketing Page - Project Memory

## Quick Facts
- **Project:** WellFi Scrollytelling Marketing Page
- **Stack:** Next.js 14 (App Router), Tailwind CSS, GSAP ScrollTrigger, Framer Motion, React Three Fiber (optional)
- **Deployment:** Vercel (will link to MPS Wix site)
- **Brand:** WellFi by MPS Group (mpsgroup.ca)
- **Target:** Cold production engineers in Canadian oilsands (Clearwater, Blue Sky, Grand Rapids formations)

## Commands
```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check

# Deployment
vercel               # Deploy to Vercel (preview)
vercel --prod        # Deploy to production
```

## Key Directories
```
wellfi-marketing/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Main scrollytelling page
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles + Tailwind
│   ├── components/
│   │   ├── sections/           # Each scroll section component
│   │   ├── three/              # 3D components (if used)
│   │   └── ui/                 # Reusable UI elements
│   ├── lib/
│   │   ├── animations.ts       # GSAP timeline configs
│   │   └── constants.ts        # Colors, specs, content
│   └── assets/
│       ├── models/             # GLB files for 3D
│       └── images/             # Static images
├── public/
│   └── documents/              # Tech sheet PDF
└── .claude/                    # Claude Code config
```

## Design System

### Brand Colors (from WellFi logo)
```css
--wellfi-navy:      #1a365d    /* Deep blue - primary backgrounds */
--wellfi-blue:      #2563eb    /* Bright blue - accents */
--wellfi-cyan:      #22d3ee    /* Cyan - highlights, signals, glows */
--wellfi-teal:      #0d9488    /* Teal - secondary accents */
--wellfi-slate:     #0f172a    /* Dark slate - main backgrounds */
--wellfi-slate-800: #1e293b    /* Lighter slate - cards */
--wellfi-white:     #f8fafc    /* Off-white - text on dark */
```

### Typography
- **Headlines:** Inter or Outfit (modern, engineering feel)
- **Body:** Inter
- **Mono/Tech:** JetBrains Mono (for specs)

### Design Principles
1. Dark mode first - matches logo aesthetic
2. Generous whitespace - let content breathe
3. Subtle animations - enhance, don't distract
4. Engineering credibility - precise specs, technical accuracy
5. Progressive disclosure - overview first, details on demand

## Product Knowledge

### WellFi - Core Value Proposition
**"Wireless Below. Insight Above."**

Real-time downhole monitoring. Wirelessly. For 5+ years.

### What It Does
Wireless downhole gauge that transmits pressure and temperature data through steel casing using electromagnetic telemetry.

### Key Specifications
| Parameter | Value |
|-----------|-------|
| Temperature Rating | 302°F (150°C) |
| Pressure Rating | 10,000 psi |
| Battery Life | 5+ years |
| O.D. | 1.83" (46mm) |
| Pressure Resolution (Piezo) | 0.04 psi |
| Pressure Resolution (Quartz) | 0.006 psi |
| Data Output | MODBUS RS-485, 4-20mA optional |

### Physical Assembly (Top to Bottom)
1. **Top Clamp** - Interference fit to Pup Joint #1 (bare steel contact, wire-wheeled)
2. **Signal Collar Adapter** - Electrical contact point for EM transmission
3. **Electronics Sonde** - Sensors and transmitter
4. **Battery Barrel(s)** - Modular: 17Ah/34Ah/51Ah options
5. **PEEK Clamp** - Vibration dampening
6. **FIBERGLASS COLLAR** - 6.25", STAR 2-3/8" 8RD EUE, 2000# (ELECTRICAL ISOLATION)
7. **Bottom Clamp** - Interference fit to Pup Joint #2

**Total Assembly:** ~25-30ft (two 10ft minimum pups + gauge)

### How EM Telemetry Works
1. Electronics Sonde generates low-frequency EM signal (1-10 Hz)
2. Signal Collar creates electrical contact with Pup #1
3. Fiberglass collar forces signal through formation (not short-circuit through steel)
4. Signal propagates up casing/tubing and through earth
5. Surface Box detects voltage between wellhead and ground stake (10m+ separation)
6. MODBUS RS-485 output to existing SCADA

### DeltaPressure Feature
- **Monitor interval:** e.g., every 10 minutes (low battery use)
- **Transmit interval:** e.g., every 8 hours (scheduled updates)
- **Exception alerts:** Immediate when reading exceeds H/L threshold
- Example: 1500 kPa ±150 kPa → alerts if <1350 or >1650

### Market Position
| vs. Alternative | WellFi Advantage |
|-----------------|------------------|
| Wired Gauges | No cable strapping, faster install, no cable failures |
| Fiber Optic | Significant cost savings, simpler installation |
| No Monitoring | Prevent pump burnout, optimize production |

### Proof Points (use carefully)
- 130+ wells operating (Australia)
- Zero tool failures to date
- Increased optimization reported by operators

## Page Structure - Scrollytelling Sections

### Section 1: Hero
**Tagline:** "Wireless Below. Insight Above."
**Headline:** Real-time downhole monitoring. Wirelessly. For 5+ years.
**Subtext:** 5+ year battery life. SCADA-ready. Zero cables.

### Section 2: The Wireless Alternative
**Message:** Reliable. Simple. Powerful.
Icon grid with minimal text - let engineers fill in the benefits mentally.

### Section 3: The Technology
**Message:** Electromagnetic Telemetry — The New Standard
Technical credibility without overwhelming. Animated signal path diagram.

### Section 4: The Product
**Message:** Modular Design. Engineered Integrity.
Scrollytelling through component assembly.

### Section 5: Installation
**Message:** Quicker Install. No Strings Attached.
Exploded view animation, position in completion string.

### Section 6: Integration
**Message:** Plug and Play
System diagram: Wellhead → Surface Box → RTU → SCADA
Stylized mockup (not dated software screenshots).

### Section 7: Intelligence
**Message:** Deploy and Forget. We'll Alert You.
DeltaPressure feature visualization.

### Section 8: Results
**Message:** Less Downtime. Fewer Workovers. Optimized Production.
Counter: "130+ installs and counting"
Before/after fluid level comparison.

### Section 9: Specifications
**Message:** The Details. For When You're Ready to Go Deeper.
Clean spec table + downloadable tech sheet PDF.

### Section 10: Call to Action
**Message:** Become Wireless.
Two paths: "Contact Us Now" / "Download Tech Sheet"

## Code Style

### TypeScript
- Strict mode enabled
- Prefer interfaces over types
- No `any` - use `unknown` or proper types
- Components in PascalCase
- Hooks and utils in camelCase

### React/Next.js
- Use App Router patterns (not Pages Router)
- Server Components by default, 'use client' only when needed
- Prefer composition over prop drilling
- Keep components focused and small

### Tailwind
- Use design system colors from constants
- Mobile-first responsive design
- Use `cn()` utility for conditional classes

### Animations
- GSAP ScrollTrigger for scroll-based animations
- Framer Motion for component-level animations
- Keep animations subtle and purposeful
- Always respect `prefers-reduced-motion`

## Critical Rules

1. **Never use stock photos** - Diagrams, icons, 3D renders only
2. **No marketing fluff** - Engineers see through it
3. **Accuracy first** - Every spec must be correct
4. **Mobile responsive** - Many engineers check on phones in the field
5. **Fast loading** - Optimize images, lazy load sections
6. **SCADA terminology** - Use industry terms correctly (MODBUS, RTU, etc.)

## External Resources

### MCPs to Use
- **Vercel MCP** - Deployment and preview URLs
- **Blender MCP** - 3D asset creation if needed
- **Context7** - Library documentation lookup

### Skills to Load
- Read `/mnt/skills/public/frontend-design/SKILL.md` for design guidance
- Check Vercel React Best Practices for performance patterns

### Reference Documents (in /mnt/project/)
- `RES01001B__1_8_3_IN_Wireless_Gauge_Modular.pdf` - Gauge specs
- `RESSPS001C__Wireless_Gauge_Platform.pdf` - Surface system specs
- `RLKSOP003__Surface_Installation_Instructions.pdf` - Installation guide
- `Wireless_Electromagnetic_Telelmetry_for_metla_cased_wells.pdf` - Technical paper
- `WellFi_Logo_V3.png` - Brand logo
- `tool_model.js` - Existing 3D model data
