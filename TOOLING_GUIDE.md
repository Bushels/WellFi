# WellFi Project: Claude Code Tooling Guide

This document explains when and how to use each tool, MCP, plugin, and resource available in Claude Code for this project. Follow this guide to maximize efficiency and ensure consistent quality.

---

## Table of Contents

1. [Project Structure Overview](#project-structure-overview)
2. [MCP Servers](#mcp-servers)
3. [Skills](#skills)
4. [Commands](#commands)
5. [External Resources](#external-resources)
6. [Phase-by-Phase Tool Usage](#phase-by-phase-tool-usage)
7. [Workflow Patterns](#workflow-patterns)
8. [Checkpoints and Verification](#checkpoints-and-verification)

---

## Project Structure Overview

```
wellfi-marketing/
├── CLAUDE.md                 # Project memory (READ FIRST EVERY SESSION)
├── prd.json                  # Task tracking (Ralph-style)
├── progress.txt              # Learnings log (append-only)
├── .claude/
│   ├── skills/
│   │   ├── scrollytelling-gsap/SKILL.md
│   │   └── wellfi-product/SKILL.md
│   └── commands/
│       ├── new-section.md
│       └── status.md
├── src/                      # Application code
└── public/                   # Static assets
```

---

## MCP Servers

### Vercel MCP
**When to Use:**
- Deploying preview builds after completing a section
- Checking deployment status
- Configuring custom domains
- Debugging build failures

**Key Commands:**
```
Vercel:deploy_to_vercel          # Deploy current state
Vercel:list_deployments          # See all deployments
Vercel:get_deployment_build_logs # Debug failed builds
Vercel:search_vercel_documentation # Look up Vercel features
```

**Workflow Pattern:**
1. Complete a section or phase
2. Run `npm run build` locally to verify
3. Deploy to Vercel for preview
4. Share preview URL for review
5. Iterate based on feedback

### Blender MCP
**When to Use:**
- Converting FreeCAD models to GLB for web
- Applying NPR/Ghibli-style materials (if going that route)
- Optimizing 3D geometry for web performance
- Creating renders for static diagrams

**Key Commands:**
```
blender:get_scene_info           # Check current scene
blender:execute_blender_code     # Run Python scripts
blender:search_polyhaven_assets  # Find HDRI/textures
blender:download_polyhaven_asset # Download assets
```

**When NOT to Use:**
- If we're using 2D diagrams instead of 3D
- For simple SVG illustrations (use code instead)

### Context7
**When to Use:**
- Looking up current documentation for libraries
- Verifying API patterns before implementing
- When unsure about Next.js 14 App Router specifics
- Checking GSAP ScrollTrigger API

**Key Commands:**
```
Context7:resolve-library-id      # Get library ID first
Context7:get-library-docs        # Then get docs
```

**Libraries You'll Query:**
- `/vercel/next.js` - Next.js patterns
- `/greensock/gsap` - GSAP animations
- `/framer/motion` - Framer Motion
- `/tailwindlabs/tailwindcss` - Tailwind utilities

### Supabase MCP
**When to Use:**
- Only if we add a contact form with database storage
- Currently NOT needed for this project

---

## Skills

### scrollytelling-gsap
**Location:** `.claude/skills/scrollytelling-gsap/SKILL.md`

**When to Use:**
- Implementing any scroll-triggered animation
- Building pinned/sticky sections (Section 4: Product Explorer)
- Creating scroll progress indicators
- Adding entrance animations to sections

**Key Patterns:**
- useGSAP hook for React integration
- ScrollTrigger for scroll-based triggers
- Scrub for scroll-synced animations
- Pin for sticky sections

### wellfi-product
**Location:** `.claude/skills/wellfi-product/SKILL.md`

**When to Use:**
- Writing any content about WellFi
- Implementing specification displays
- Creating component diagrams
- Ensuring technical accuracy

**Always Reference For:**
- Correct specifications
- Proper terminology
- Component names and order
- Brand messaging

---

## Commands

### /status
**When to Use:**
- At the start of each coding session
- After completing a task
- To find the next priority item

**What It Does:**
- Reads prd.json
- Shows completion progress
- Identifies next task
- Checks dependencies

### /new-section [SectionName]
**When to Use:**
- Starting implementation of a new section
- Need boilerplate with correct patterns

**What It Does:**
- Creates component with proper structure
- Includes animation boilerplate
- Sets up refs and hooks correctly

---

## External Resources

### Vercel React Best Practices
**Repository:** `vercel-labs/agent-skills/skills/react-best-practices`

**When to Use:**
- Before implementing complex components
- When optimizing performance
- To avoid common React anti-patterns

**How to Install:**
```bash
npx add-skill vercel-labs/agent-skills
```

**Key Rules to Follow:**
1. Eliminate async waterfalls
2. Reduce bundle size
3. Optimize re-renders
4. Use proper server/client boundaries

### Ralph Pattern (for PRD management)
**Repository:** `snarktank/ralph`

**How We Use It:**
- `prd.json` tracks all tasks with `passes: true/false`
- Each task is small enough for one context window
- `progress.txt` captures learnings between sessions
- Tasks are ordered by priority and dependencies

**Workflow:**
1. Check prd.json for next task
2. Implement task
3. Run quality checks
4. Update `passes: true` if complete
5. Add learnings to progress.txt

### Claude Code Showcase
**Repository:** `ChrisWiles/claude-code-showcase`

**Reference For:**
- CLAUDE.md best practices
- Skill file format
- Hook configurations
- Agent patterns

---

## Phase-by-Phase Tool Usage

### Phase 1: Foundation
**Tools Needed:**
| Tool | Purpose |
|------|---------|
| bash | npm create, install dependencies |
| file creation | Project structure, config files |
| Context7 | Next.js 14 App Router patterns |
| Vercel MCP | Initial deployment setup |

**Checkpoints:**
- [ ] `npm run dev` works
- [ ] `npm run build` succeeds
- [ ] Vercel preview deploys
- [ ] Design tokens in Tailwind config

### Phase 2: Static Sections
**Tools Needed:**
| Tool | Purpose |
|------|---------|
| file creation | Component files |
| wellfi-product skill | Accurate content |
| Context7 | Tailwind utilities |
| Vercel MCP | Preview deployments |

**Checkpoints:**
- [ ] Each section renders
- [ ] Responsive on mobile
- [ ] Content matches CLAUDE.md specs
- [ ] Deploy and verify visually

### Phase 3: Interactive Sections
**Tools Needed:**
| Tool | Purpose |
|------|---------|
| scrollytelling-gsap skill | Animation patterns |
| Context7 | GSAP ScrollTrigger API |
| Vercel MCP | Preview for testing |

**Checkpoints:**
- [ ] Animations trigger correctly
- [ ] Pinned sections work
- [ ] No jank/stutter
- [ ] Works on mobile/touch

### Phase 4: Animation Polish
**Tools Needed:**
| Tool | Purpose |
|------|---------|
| scrollytelling-gsap skill | Entrance animations |
| Context7 | Framer Motion patterns |

**Checkpoints:**
- [ ] All sections have entrance animations
- [ ] Respects prefers-reduced-motion
- [ ] Smooth 60fps

### Phase 5: Performance & Polish
**Tools Needed:**
| Tool | Purpose |
|------|---------|
| bash | Lighthouse audit, bundle analysis |
| Vercel MCP | Production deployment |
| Context7 | Next.js optimization |

**Checkpoints:**
- [ ] Lighthouse 90+ performance
- [ ] Mobile audit passed
- [ ] Bundle size reasonable

### Phase 6: Deliverables
**Tools Needed:**
| Tool | Purpose |
|------|---------|
| PDF skill | Tech sheet generation |
| file creation | Final assets |

**Checkpoints:**
- [ ] Tech sheet PDF works
- [ ] All downloads functional

---

## Workflow Patterns

### Starting a New Session
```
1. Read CLAUDE.md to refresh context
2. Run /status to see next task
3. Read relevant skills for the task
4. Implement the task
5. Run quality checks
6. Update prd.json
7. Deploy preview if significant change
8. Log learnings to progress.txt
```

### Implementing a Section
```
1. Read wellfi-product skill for content accuracy
2. Read scrollytelling-gsap skill if animated
3. Create component file
4. Build static version first
5. Add animations
6. Test responsiveness
7. Deploy and verify
8. Mark task complete in prd.json
```

### Debugging Build Failures
```
1. Run npm run build locally first
2. Check console for specific error
3. If Vercel-specific, use Vercel:get_deployment_build_logs
4. Search Context7 for the error pattern
5. Fix and redeploy
```

### Looking Up Documentation
```
1. Context7:resolve-library-id with library name
2. Context7:get-library-docs with the returned ID
3. Focus search with topic parameter
```

---

## Checkpoints and Verification

### After Each Section
- [ ] Component renders without errors
- [ ] Content matches product specs
- [ ] Responsive: 320px, 768px, 1280px
- [ ] Animations work (if applicable)
- [ ] Accessibility: proper headings, alt text

### After Each Phase
- [ ] All phase tasks have `passes: true`
- [ ] Preview deployment works
- [ ] Visual review completed
- [ ] progress.txt updated with learnings

### Before Production
- [ ] All prd.json tasks complete
- [ ] Lighthouse audit passed
- [ ] Mobile testing completed
- [ ] Tech sheet PDF works
- [ ] CTAs functional
- [ ] Final content review

---

## Quick Reference Card

| Need To... | Use This |
|------------|----------|
| Check next task | `/status` command |
| Create new section | `/new-section` command |
| Look up library API | Context7 MCP |
| Deploy preview | Vercel:deploy_to_vercel |
| Debug build | Vercel:get_deployment_build_logs |
| Write WellFi content | wellfi-product skill |
| Add scroll animation | scrollytelling-gsap skill |
| Convert 3D model | Blender MCP |
| Log learning | Append to progress.txt |
| Mark task done | Update prd.json passes: true |

---

## Remember

1. **Read CLAUDE.md first** every session
2. **Small tasks** - each should complete in one context
3. **Deploy often** - catch issues early
4. **Log learnings** - future sessions benefit
5. **Verify accuracy** - use wellfi-product skill for content
6. **Test mobile** - engineers check phones in the field
