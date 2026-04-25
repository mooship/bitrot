# Desktop Layout Refinement

**Date:** 2026-04-25  
**Status:** Approved

## Problem

On wide desktop viewports (1280px+) the layout has several proportioning issues:

- The FilterBar's inner container uses `--max-width` (1280px), making the search input stretch far wider than the content column it sits above.
- Filter chips and the search bar use `--touch-target` (44px) minimum height — appropriate for mobile, chunky on desktop.
- The daily obituary card is compact and doesn't assert itself as a hero moment.
- The timeline grid is 2 columns at all widths ≥640px, wasting space on wide screens.
- Year range inputs use `5ch` width, clipping 4-digit years.

## Decisions

**Single visual spine at 720px for filter area.** The FilterBar `inner` container narrows to `--timeline-width` (720px), aligning it with the daily card and timeline below.

**Hero treatment for the daily card on desktop.** Larger type and more generous padding to give the entry real presence.

**Compact desktop chip/input height.** At ≥640px, filter chips and search bar drop to 32px height with tighter padding — proper desktop proportions.

**3-column timeline grid at 1280px+.** The timeline section expands to `--max-width` (1280px) with a 3-column grid. Year markers already span `grid-column: 1 / -1` so they work without changes.

## Changes by File

### `FilterBar.module.css`

- `.inner` `max-width`: `var(--max-width)` → `var(--timeline-width)` (720px)
- `.yearInput` `inline-size`: `5ch` → `6ch`
- Desktop breakpoint (≥640px) overrides:
  - `.searchInputWrap` `min-height`: `var(--touch-target)` → 32px
  - `.chip` `min-height`: `var(--touch-target)` → 32px
  - `.chip` padding: `--space-1` / `--space-3` → `--space-1` / `--space-2`
  - `.yearInput` `min-height`: `var(--touch-target)` → 32px
  - `.clearBtn` `min-height`: `var(--touch-target)` → 32px

### `DailyObituary.module.css`

- Desktop breakpoint (≥640px) overrides:
  - `.banner` padding: bumps to `--space-6` block / `--space-8` inline
  - `.banner` block margin: `--space-6` top / `--space-8` bottom; inline margin stays `auto` (centering)
  - `.name` `font-size`: `var(--text-xl)` → `var(--text-3xl)`
  - `.tagline` `font-size`: `var(--text-base)` → `var(--text-lg)`

### `Timeline.module.css`

- Existing 640px breakpoint: no change (2 columns, `--timeline-width`)
- New 1280px breakpoint:
  - `.section` `max-width`: `var(--max-width)` (1280px)
  - `.list` `grid-template-columns`: `1fr 1fr 1fr`

## Out of Scope

- Mobile layout (no changes below 640px)
- EntryCard internal layout
- Header proportions
- Any content or data changes
