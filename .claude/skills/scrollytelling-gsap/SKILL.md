---
name: scrollytelling-gsap
description: GSAP ScrollTrigger patterns for scrollytelling animations. Use when implementing scroll-based animations, pinned sections, or scroll-triggered effects in React/Next.js.
---

# Scrollytelling with GSAP ScrollTrigger

## When to Use
- Creating scroll-triggered animations
- Building pinned/sticky sections
- Implementing parallax effects
- Synchronizing animations with scroll position

## Installation
```bash
npm install gsap @gsap/react
```

## Core Setup in Next.js

### Register GSAP Plugins (layout.tsx or _app.tsx)
```typescript
'use client';
import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once at app level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
```

### Basic Scroll-Triggered Animation
```typescript
'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function FadeInSection({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
      },
    });
  }, { scope: containerRef });

  return <div ref={containerRef}>{children}</div>;
}
```

### Pinned Scrollytelling Section
```typescript
'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function PinnedSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300%', // 3x viewport height of scroll distance
        pin: true,
        scrub: 1, // Smooth scrubbing
      },
    });

    // Add animations to timeline
    tl.to('.step-1', { opacity: 1, duration: 1 })
      .to('.step-1', { opacity: 0, duration: 0.5 })
      .to('.step-2', { opacity: 1, duration: 1 })
      .to('.step-2', { opacity: 0, duration: 0.5 })
      .to('.step-3', { opacity: 1, duration: 1 });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="h-screen relative">
      <div ref={contentRef} className="absolute inset-0">
        <div className="step-1 opacity-0 absolute inset-0">Step 1 Content</div>
        <div className="step-2 opacity-0 absolute inset-0">Step 2 Content</div>
        <div className="step-3 opacity-0 absolute inset-0">Step 3 Content</div>
      </div>
    </div>
  );
}
```

### Scroll Progress Indicator
```typescript
'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(progressRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });
  });

  return (
    <div
      ref={progressRef}
      className="fixed top-0 left-0 h-1 bg-cyan-400 origin-left z-50"
      style={{ transform: 'scaleX(0)', width: '100%' }}
    />
  );
}
```

### Staggered Children Animation
```typescript
'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function StaggeredGrid({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.grid-item', {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="grid grid-cols-3 gap-4">
      {children}
    </div>
  );
}
```

## ScrollTrigger Options Reference

| Option | Description | Example |
|--------|-------------|---------|
| `trigger` | Element that triggers animation | `containerRef.current` |
| `start` | When animation starts | `'top 80%'`, `'top top'` |
| `end` | When animation ends | `'bottom 20%'`, `'+=500px'` |
| `scrub` | Ties animation to scroll position | `true`, `1` (smoothing) |
| `pin` | Pins the trigger element | `true` |
| `toggleActions` | play/reverse on enter/leave | `'play none none reverse'` |
| `markers` | Show debug markers | `true` (dev only) |

## Anti-Patterns

### ❌ Don't: Create ScrollTrigger outside useGSAP
```typescript
// BAD - Memory leaks and React conflicts
useEffect(() => {
  ScrollTrigger.create({ ... });
}, []);
```

### ✅ Do: Use useGSAP hook
```typescript
// GOOD - Proper cleanup
useGSAP(() => {
  gsap.to(..., { scrollTrigger: { ... } });
}, { scope: containerRef });
```

### ❌ Don't: Forget to register plugin
```typescript
// BAD - Will fail silently
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Missing: gsap.registerPlugin(ScrollTrigger);
```

## Accessibility

Always respect reduced motion preference:
```typescript
useGSAP(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Skip animations or use instant transitions
    gsap.set('.animated-element', { opacity: 1, y: 0 });
    return;
  }
  
  // Normal animations
  gsap.from('.animated-element', { ... });
});
```

## WellFi Hero Coordination Rule

If GSAP is orchestrating the WellFi startup hero while Canvas 2D renders the wave:
- read the sweep duration from the canvas module instead of hardcoding duplicate hero times
- treat the canvas as the source of timing truth and GSAP as the reveal coordinator
- do not "fix" a visual gap by adding extra timeline beats if the real issue is section height or spacing
- keep direct interaction enabled only after the approved sweep completes

## Related Skills
- `framer-motion` - For component-level animations
- `react-three-fiber` - For 3D scroll interactions
