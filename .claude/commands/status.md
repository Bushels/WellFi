---
description: Check project status and determine next task from PRD
allowed-tools: Read, Bash
---

# Project Status Check

Check the current project status and identify the next task to work on.

## Steps

1. Read the PRD to see current progress:
   ```
   Read prd.json
   ```

2. Find the first story where `passes: false`:
   ```
   Parse prd.json and find first incomplete story (ordered by priority)
   ```

3. Check if dependencies are met:
   - Look at the `dependencies` array
   - Verify all dependency stories have `passes: true`

4. If dependencies not met, find the blocking story instead

5. Output:
   - Current phase
   - Next story ID and title
   - Acceptance criteria for that story
   - Any blockers

## Output Format

```
## Current Status
- Phase: [current phase]
- Completed: X/Y stories
- Progress: X%

## Next Task
Story: [ID] - [Title]
Priority: [number]
Phase: [phase name]

### Description
[story description]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
...

### Dependencies
[list any dependencies and their status]

## Ready to Start
[Yes/No - based on dependency check]
```
