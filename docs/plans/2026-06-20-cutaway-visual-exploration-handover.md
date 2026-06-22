# WellFi Cutaway Visual Exploration Handover

Date: 2026-06-20

Status: image-generation exploration parked. Next session should return to a deterministic R3F cutaway, not continue prompt-chasing.

## Current Decision

- The approved live `/wellfi` island hero remains parked and untouched.
- The image-generation branch helped clarify visual language, but it broke down when asked to combine exact open-hole multilateral geometry, pay-zone geology, dogleg semantics, and the WellFi coupling in one photoreal render.
- Next session should build the cutaway in R3F with explicit geometry so the well path, casing/open-hole boundary, laterals, and coupling placement are controlled instead of inferred by an image model.

## Useful Visual Lessons

- The strongest simple product read was the short, smooth light-blue fiberglass coupling made up between two steel pipe sections, with no visible threads.
- The coupling should imply the threaded connection internally. Do not show exposed EUE pins, visible thread engagement, or black shoulder stacks unless Kyle explicitly asks for a technical-detail image.
- A realistic dogleg from surface is a smooth directional-drilling build section: vertical or steep section -> gradual large-radius build -> deviated tangent. It is not a pipe elbow, kink, or 90-degree fitting.
- If showing intermediate casing, use a sectioned casing wall with wall thickness and the internal assembly visible inside it. Do not make the coupling look strapped outside the casing.
- For open-hole multilateral work, remove the intermediate-casing shell from the reservoir interval. Show exposed open-hole bores and lateral branches in the pay, not steel casing wrapping the entire path.
- The formation should resemble Alberta heavy-oil Bluesky/Clearwater geology, not generic decorative cliff rock:
  - thicker dark bitumen-saturated oil-sands pay;
  - muddy sandstone, siltstone, shale drapes, grey-green glauconitic sandstone;
  - thin laminae, mud drapes, and bitumen-stained streaks;
  - less regular stacked-block texture.

## Imagegen Outputs Worth Keeping As References

All are preview/reference assets under `C:\Users\kyle\.codex\generated_images\019ee626-be87-73c0-930b-4f4acc338e6d\`.

- `ig_0e3fa92ec98de402016a36ef16fb088193a1479b353d941734.png`
  - Best reference for the short light-blue coupling: smooth sleeve, no visible threads, two pipe ends made up internally.
- `ig_0494661597d90e82016a36f6476544819ab6d1f305b64609bb.png`
  - Useful dogleg reminder: surface/steep section into a smooth build section, then tangent. Coupling placement on build section is directionally useful.
- `ig_0299366ee02ce6d8016a36f986b1148199ab0d4d83d0d4e507.png`
  - Useful intermediate-casing cutaway reference: sectioned casing wall with blue coupling visible inside.
- `ig_070591ca9d1474a6016a36fbaff8a88198bc4a9762e35fcd38.png`
  - Useful formation reference: better Bluesky/Clearwater-like fabric and thicker heavy-oil pay than the early generic block.

## Deprecated / Do Not Continue

- `ig_021c9ca8e68df942016a36fd62b0708198abc6bd6a98383c09.png`
  - Failed open-hole multilateral imagegen attempt. It drifted too far from the actual target geometry. Do not use it as a geometry reference.
- Prompt-chasing image generation for the open-hole multilateral hero is parked. It is no longer the recommended path for the public-facing cutaway.
- The temporary R3F `/cutaway` prototype created during this session was a useful spike, but it encoded the wrong final story after several pivots. It should not be treated as the next source of truth.

## Next R3F Prompt Seed

Use this as the opening brief for the next session:

```text
Build a deterministic R3F cutaway prototype for WellFi.

Start from the approved live WellFi site, but do not touch the parked island hero.
Create a separate review surface for the formation/open-hole cutaway.

Geometry target:
- Alberta heavy-oil formation block with thicker bitumen-saturated pay.
- Open-hole multilateral well architecture in the pay zone.
- No intermediate casing shell around the open-hole reservoir interval.
- Smooth directional curves, no pipe elbows.
- Short light-blue fiberglass coupling/tool section made up between two steel pipe sections.
- No visible threads; coupling implies internal threaded connection.
- Keep the coupling mechanically continuous and not floating.

Visual target:
- Credible Bluesky/Clearwater-style muddy oil-sands fabric.
- Premium but restrained industrial render.
- Subtle localized red telemetry glow only around the coupling.
- No sci-fi rings, neon rivers, green lasers, labels, or BHA clutter.

Verification:
- QA at `/wellfi/<prototype-route>` with desktop and mobile screenshots.
- Treat the visual bar as: credible to a petroleum/mechanical engineer at LinkedIn thumbnail size.
```

