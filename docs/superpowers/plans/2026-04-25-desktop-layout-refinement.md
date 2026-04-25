# Desktop Layout Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the desktop layout so the filter bar aligns to a 720px spine, the daily obituary card reads as a hero, filter chips are compact at desktop sizes, and the timeline grid shows 3 columns on wide screens.

**Architecture:** Pure CSS Module changes across three files — no logic, no new components. Each file is self-contained. All changes are gated behind `min-width` media queries so mobile is untouched.

**Tech Stack:** CSS Modules, Vite dev server, Playwright MCP for visual verification, Vitest for regression check.

---

### Task 1: Establish test baseline

**Files:**
- No changes — baseline run only.

- [ ] **Step 1: Run the full test suite**

```bash
npm run test
```

Expected: all tests pass. Note any pre-existing failures so you don't blame your changes for them.

- [ ] **Step 2: Confirm the dev server is running**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/index.html
```

Expected: `200`. If not, start it with `npm run dev` in background.

---

### Task 2: FilterBar — spine width + year input fix

**Files:**
- Modify: `src/components/FilterBar/FilterBar.module.css`

- [ ] **Step 1: Change `.inner` max-width and fix year input width**

In `src/components/FilterBar/FilterBar.module.css`, make two targeted changes:

In the `.inner` rule (near the top of the file), change `max-width`:
```css
/* before */
.inner {
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* after */
.inner {
  max-width: var(--timeline-width);
  margin-inline: auto;
  padding-inline: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

In the `.yearInput` rule, change `inline-size`:
```css
/* before */
.yearInput {
  inline-size: 5ch;

/* after */
.yearInput {
  inline-size: 6ch;
```

- [ ] **Step 2: Verify the existing 640px mobile breakpoint is intact**

At the bottom of `FilterBar.module.css`, the `@media (max-width: 639px)` block must remain unchanged. Read the bottom of the file and confirm it's still there.

- [ ] **Step 3: Run existing FilterBar tests**

```bash
npm run test -- --reporter=verbose src/components/FilterBar/FilterBar.test.tsx
```

Expected: all pass. These tests run in happy-dom and don't compute CSS, so they should be unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/components/FilterBar/FilterBar.module.css
git commit -m "feat: narrow filter bar spine to 720px, widen year input to 6ch"
```

---

### Task 3: FilterBar — compact desktop chip and input heights

**Files:**
- Modify: `src/components/FilterBar/FilterBar.module.css`

- [ ] **Step 1: Add desktop compact sizing block**

Append the following at the end of `src/components/FilterBar/FilterBar.module.css` (after the existing `@media (max-width: 639px)` block):

```css
@media (min-width: 640px) {
  .searchInputWrap {
    min-height: 32px;
  }

  .chip {
    min-height: 32px;
    padding: var(--space-1) var(--space-2);
  }

  .yearInput {
    min-height: 32px;
  }

  .clearBtn {
    min-height: 32px;
  }
}
```

- [ ] **Step 2: Run existing FilterBar tests**

```bash
npm run test -- --reporter=verbose src/components/FilterBar/FilterBar.test.tsx
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/FilterBar/FilterBar.module.css
git commit -m "feat: compact filter chips and inputs to 32px on desktop"
```

---

### Task 4: DailyObituary — hero treatment on desktop

**Files:**
- Modify: `src/components/DailyObituary/DailyObituary.module.css`

- [ ] **Step 1: Add desktop hero breakpoint**

Append the following at the end of `src/components/DailyObituary/DailyObituary.module.css`:

```css
@media (min-width: 640px) {
  .banner {
    padding: var(--space-6) var(--space-8);
    margin-block-start: var(--space-6);
    margin-block-end: var(--space-8);
  }

  .name {
    font-size: var(--text-3xl);
  }

  .tagline {
    font-size: var(--text-lg);
    line-height: var(--leading-relaxed);
  }
}
```

Note: `margin-block-start`/`margin-block-end` override only the vertical margins. The base rule sets `margin: var(--space-4) auto var(--space-6)` (shorthand), which gives `margin-inline: auto` for centering — these logical property overrides leave inline margins untouched.

- [ ] **Step 2: Run existing DailyObituary tests**

```bash
npm run test -- --reporter=verbose src/components/DailyObituary/DailyObituary.test.tsx
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/DailyObituary/DailyObituary.module.css
git commit -m "feat: hero treatment for daily obituary card on desktop"
```

---

### Task 5: Timeline — 3-column grid at 1280px+

**Files:**
- Modify: `src/components/Timeline/Timeline.module.css`

- [ ] **Step 1: Add wide-desktop breakpoint**

Append the following at the end of `src/components/Timeline/Timeline.module.css` (after the existing `@media (min-width: 640px)` block):

```css
@media (min-width: 1280px) {
  .section {
    max-width: var(--max-width);
  }

  .list {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

Note: `YearMarker` already has `grid-column: 1 / -1` at ≥640px, so year markers will automatically span all 3 columns — no change needed there.

- [ ] **Step 2: Run existing Timeline tests**

```bash
npm run test -- --reporter=verbose src/components/Timeline/Timeline.test.tsx
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/Timeline/Timeline.module.css
git commit -m "feat: 3-column timeline grid at 1280px+ viewports"
```

---

### Task 6: Full test suite regression check

**Files:**
- No changes.

- [ ] **Step 1: Run the full test suite**

```bash
npm run test
```

Expected: same pass/fail count as Task 1 baseline. Any new failures indicate a problem introduced in Tasks 2–5.

- [ ] **Step 2: Run Biome lint check**

```bash
npm run check
```

Expected: no errors. CSS modules are not linted by Biome so this is a quick sanity check.

---

### Task 7: Visual verification with Playwright

**Files:**
- No changes — visual check only.

- [ ] **Step 1: Open the site at 1440px viewport width**

Use Playwright to navigate and screenshot at desktop width:

```
browser_resize: width=1440, height=900
browser_navigate: http://localhost:5173
browser_take_screenshot
```

Check:
- FilterBar inner content is centered and clearly narrower than the full viewport (≈720px wide)
- Filter chips are compact (visibly smaller than the header height)
- Year input fields show 4-digit placeholder years without clipping

- [ ] **Step 2: Verify the daily obituary card hero treatment**

Check in the screenshot:
- The card has generous top/bottom breathing room
- The entry name is significantly larger (roughly 3x the eyebrow text)
- The tagline is clearly readable at a larger size than before

- [ ] **Step 3: Verify 3-column grid**

Scroll down in the page or take a full-page screenshot. Confirm the timeline card grid shows 3 columns side by side.

- [ ] **Step 4: Check 2-column fallback at mid-desktop**

```
browser_resize: width=900, height=900
browser_take_screenshot
```

Check:
- Timeline shows 2 columns (not 3) at 900px viewport
- Filter bar and daily card are still within their narrower spine

- [ ] **Step 5: Check mobile is untouched**

```
browser_resize: width=375, height=812
browser_take_screenshot
```

Check:
- Mobile layout looks identical to before (chips scroll horizontally, full-width search bar, touch-target heights)

- [ ] **Step 6: Final commit if any tweaks were made**

If any visual issues required CSS fixes during verification, commit those now:

```bash
git add src/components/FilterBar/FilterBar.module.css \
        src/components/DailyObituary/DailyObituary.module.css \
        src/components/Timeline/Timeline.module.css
git commit -m "fix: visual polish from desktop layout verification"
```

If no fixes were needed, no commit required.
