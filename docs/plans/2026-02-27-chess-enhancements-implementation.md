# Chess Arena Enhancements (Progress + Content + UX) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add persistent puzzle progression/scoring, expanded categorized lessons, and UI feedback/animation enhancements to `chess/`.

**Architecture:** Add a pure `progress-core.js` module for scoring + persistence, extend content metadata in `content.js`, and incrementally integrate with current `app.js` + `styles.css` + `index.html` while preserving existing modes and tests.

**Tech Stack:** Vanilla JS/HTML/CSS, localStorage, Node built-in test runner, `chess.js` (vendored browser build).

---

### Task 1: TDD progress core + content schema tests

**Files:**
- Create: `chess/tests/progress-core.test.js`
- Modify: `chess/tests/content.test.js`
- Create: `chess/progress-core.js`

**Steps:**
1. Write failing tests for score/stars/grades and storage roundtrip.
2. Write failing content tests for puzzle metadata + lesson categories/extra lessons.
3. Run tests to confirm red.
4. Implement minimal `progress-core.js` and schema-compatible helpers.
5. Re-run tests to green.

### Task 2: Expand puzzles and lessons

**Files:**
- Modify: `chess/content.js`

**Steps:**
1. Add per-puzzle hints/tags/difficulty/baseScore/parSeconds.
2. Add more puzzles per tier (difficulty layered).
3. Add categorized lessons for Capablanca/Fischer/Kasparov with metadata.
4. Verify content tests pass.

### Task 3: UI data surfaces for progress + hints + lessons filter

**Files:**
- Modify: `chess/index.html`
- Modify: `chess/styles.css`
- Modify: `chess/app.js`

**Steps:**
1. Add puzzle score/hint/progress widgets and lesson category filter UI.
2. Integrate `progress-core` read/write and puzzle run scoring lifecycle.
3. Add failure hint escalation and best-score display.
4. Add lesson filtering/group labels and persist lesson progress.

### Task 4: Interaction polish

**Files:**
- Modify: `chess/index.html`
- Modify: `chess/styles.css`
- Modify: `chess/app.js`

**Steps:**
1. Add AI progress bar + elapsed timer.
2. Add move animation (lightweight overlay/transition).
3. Add promotion picker icons (piece glyphs per side).
4. Quick regression checks across modes.

### Task 5: Final verification

**Files:**
- Verify: `chess/*`
- Verify: `chess/tests/*`

**Steps:**
1. Run `node --test chess/tests/*.test.js`
2. Run `node --check chess/app.js chess/content.js chess/progress-core.js chess/game-core.js chess/ai.js chess/mode-core.js`
3. Run one non-chess regression test (`tictactoe`) as spot check.
