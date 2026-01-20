---
description: Create a new scrollytelling section component with proper structure
allowed-tools: Read, Write, Grep
---

# Create New Section

Create a new section component for the WellFi marketing page.

## Arguments
- `$1` - Section name (e.g., "Hero", "Benefits", "Technology")

## Steps

1. Read the constants file to understand the design system:
   ```
   Read src/lib/constants.ts
   ```

2. Check existing sections for patterns:
   ```
   Grep "export function" src/components/sections/
   ```

3. Create the new section component at `src/components/sections/$1Section.tsx` with:
   - 'use client' directive if animations needed
   - Proper TypeScript types
   - Responsive Tailwind classes
   - useGSAP hook for scroll animations if needed
   - Accessibility considerations

4. Add the section to the main page at `src/app/page.tsx`

5. Update prd.json to mark the corresponding story as `passes: true` if this completes a story

## Template

```typescript
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function $1Section() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Add scroll-triggered animations here
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center bg-slate-900"
    >
      <div className="container mx-auto px-4">
        {/* Section content */}
      </div>
    </section>
  );
}
```
