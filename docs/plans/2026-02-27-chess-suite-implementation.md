# Chess Suite (PvP + AI + Puzzle + Lessons) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a playable chess mini game in `chess/` with local two-player mode, human-vs-AI mode (alpha-beta search), mate-in-N puzzle challenge mode (1/2/3 moves), and classic game lesson playback with annotations.

**Architecture:** Use `chess.js` (CDN) for move legality, game state, SAN/PGN parsing, and checkmate/draw detection. Keep project-specific logic in small vanilla JS modules: content datasets (`content.js`), mode/puzzle state helpers (`mode-core.js`), AI search (`ai.js`), and DOM/UI orchestration (`app.js`). Tests cover pure local modules with Node's built-in test runner.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, `chess.js` (browser CDN), Node built-in test runner (`node:test`).

---

### Task 1: TDD scaffolding for content and mode state

**Files:**
- Create: `chess/tests/content.test.js`
- Create: `chess/tests/mode-core.test.js`
- Create: `chess/content.js`
- Create: `chess/mode-core.js`

**Step 1: Write failing tests**
- Assert puzzle tiers `mate1/mate2/mate3` exist and each puzzle has setup moves + solution line.
- Assert lesson list exists with SAN moves and annotations.
- Assert mode-core can create/select puzzle state and advance/reset lesson index.

**Step 2: Run tests to verify failures**
Run: `node --test chess/tests/*.test.js`
Expected: FAIL because modules do not exist yet.

**Step 3: Implement minimal modules**
- Export UMD-compatible modules for browser + Node tests.
- Keep pure, engine-independent shape validation helpers.

**Step 4: Re-run tests (green)**
Run: `node --test chess/tests/*.test.js`
Expected: PASS.

### Task 2: Implement chess engine integration + AI (search)

**Files:**
- Create: `chess/ai.js`
- Create: `chess/game-core.js`
- Optional test coverage for pure helpers if practical.

**Step 1: Add AI search helpers**
- Alpha-beta minimax, depth-based scoring, move ordering, checkmate/stalemate evaluation.
- Piece-square tables for positional scoring.

**Step 2: Add game-core wrappers**
- New game creation, move application, game status summary, puzzle position setup from SAN sequence, lesson replay utilities.

**Step 3: Manual verification in browser (later with UI)**
- Ensure AI returns legal moves and game status updates correctly.

### Task 3: Build chess UI with all modes

**Files:**
- Create: `chess/index.html`
- Create: `chess/styles.css`
- Create: `chess/app.js`

**Step 1: Create layout and controls**
- Mode switcher: local PvP / vs AI / puzzles / lessons
- Shared board, side panel, status, move list, reset buttons
- AI controls (depth, player side if supported)

**Step 2: Implement board interaction**
- Click-to-select pieces, highlight legal targets, apply moves, move history, game-end status
- Promotion handling (default queen or chooser)

**Step 3: Implement mode-specific flows**
- PvP turn handling
- AI auto move scheduling and thinking state
- Puzzle tier selection + scripted line validation + progress feedback
- Lesson selection + next/prev step playback + annotation panel

**Step 4: Handle error states**
- Missing `chess.js` CDN load
- Invalid dataset move sequences

### Task 4: Integrate into site navigation and docs

**Files:**
- Modify: `index.html`
- Modify: `README.md`

**Step 1: Add chess card to homepage**
**Step 2: Add chess link/feature summary to README**

### Task 5: Final verification

**Files:**
- Verify: `chess/*`
- Verify: `chess/tests/*`
- Verify: `index.html`
- Verify: `README.md`

**Step 1: Run unit tests**
Run: `node --test chess/tests/*.test.js`
Expected: PASS.

**Step 2: Run existing smoke checks (optional, if fast)**
Run: `node --test tictactoe/tests/game-core.test.js`
Expected: PASS (regression spot-check).

**Step 3: Structure check**
Run: `find chess -maxdepth 2 -type f | sort`
Expected: HTML/CSS/JS/tests files present.
