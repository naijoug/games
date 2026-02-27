# Xiangqi Mini Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a playable Chinese chess mini game in `xiangqi/` with local PvP and PvE (3 AI levels), complete movement rules, core endgame detection, and near-competition repeated-position adjudication for common long-check/long-chase cases.

**Architecture:** Use a pure rules engine (`xiangqi/game-core.js`) in UMD format for browser + Node tests, a separate AI module (`xiangqi/ai.js`) for search/evaluation, and a DOM UI layer (`xiangqi/app.js`) with static HTML/CSS. Keep the engine immutable so UI undo works via state snapshots and AI can safely search simulated positions.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Node built-in test runner (`node:test`), no external dependencies.

---

### Task 1: Scaffold Xiangqi core tests first (TDD)

**Files:**
- Create: `xiangqi/tests/game-core.test.js`
- Create: `xiangqi/game-core.js`

**Step 1: Write failing tests for core state and representative movement rules**
- Initial setup includes both kings and correct side to move.
- Horse movement is blocked by horse-leg.
- Cannon capture requires exactly one screen.
- Illegal move exposing own king is rejected.

**Step 2: Run test to verify it fails**
Run: `node --test xiangqi/tests/game-core.test.js`
Expected: FAIL because `xiangqi/game-core.js` is missing or behavior is unimplemented.

**Step 3: Write minimal engine skeleton and move generation**
- Implement UMD exports and `createGame`, `getLegalMoves`, `makeMove`.
- Add board setup, piece movement rules, self-check filtering, and base status updates.

**Step 4: Run test to verify it passes**
Run: `node --test xiangqi/tests/game-core.test.js`
Expected: initial tests PASS.

**Step 5: Commit**
```bash
git add xiangqi/game-core.js xiangqi/tests/game-core.test.js
git commit -m "feat: add xiangqi core engine skeleton"
```

### Task 2: Extend engine with check/checkmate/stalemate and repetition adjudication (TDD)

**Files:**
- Modify: `xiangqi/game-core.js`
- Modify: `xiangqi/tests/game-core.test.js`

**Step 1: Write failing tests for tactical and terminal rules**
- In-check side only has response moves.
- Detect checkmate and stalemate in crafted positions.
- Detect common long-check repeated cycle and assign forbidden repeat loss.
- Detect ambiguous repeated cycle and return draw.

**Step 2: Run tests to verify failures**
Run: `node --test xiangqi/tests/game-core.test.js`
Expected: FAIL on new rule assertions.

**Step 3: Implement minimal logic to pass**
- Add `isInCheck`, `getStatus`, and repeated-position analysis from `history`.
- Store move metadata (`givesCheck`, `chaseTargets`, `positionKeyAfter`).
- Apply near-competition priority: long-check > long-chase > draw.

**Step 4: Re-run tests and keep green**
Run: `node --test xiangqi/tests/game-core.test.js`
Expected: PASS.

### Task 3: Add AI module with 3 difficulty levels (TDD)

**Files:**
- Create: `xiangqi/ai.js`
- Create: `xiangqi/tests/ai.test.js`
- Modify: `xiangqi/game-core.js` (only if helper exports are needed)

**Step 1: Write failing AI tests**
- AI returns a legal move.
- AI responds legally when in check.
- Hard mode returns within a time budget (loose threshold).

**Step 2: Run tests to verify failures**
Run: `node --test xiangqi/tests/ai.test.js`
Expected: FAIL because AI module is missing/unimplemented.

**Step 3: Implement minimal AI**
- Add evaluation, move ordering, negamax alpha-beta.
- Map levels to depth/time budgets.
- Add iterative deepening for hard mode.

**Step 4: Re-run AI tests**
Run: `node --test xiangqi/tests/ai.test.js`
Expected: PASS.

### Task 4: Build Xiangqi UI (HTML/CSS/JS) and wire PvP/PvE modes

**Files:**
- Create: `xiangqi/index.html`
- Create: `xiangqi/styles.css`
- Create: `xiangqi/app.js`

**Step 1: Build static layout and controls**
- Board area, status panel, mode/difficulty/side selectors, undo/restart buttons.

**Step 2: Render board and legal move highlights**
- Click-to-select and click-to-move interactions.
- Show selected piece and legal destinations.

**Step 3: Wire game engine + undo snapshots**
- Maintain state stack for undo behavior (PvP 1-step, PvE usually 2-step).
- Reflect check/checkmate/stalemate/repetition messages.

**Step 4: Wire AI turns**
- Lock input on AI turn.
- Trigger `chooseMove` with level-based budgets.
- Apply move and re-render.

**Step 5: Manual verification in browser**
Run: open `xiangqi/index.html`
Expected: both PvP and PvE playable.

### Task 5: Add root entry and final verification

**Files:**
- Modify: `index.html`
- Verify: `xiangqi/*`, `xiangqi/tests/*`, `docs/plans/*`

**Step 1: Add Xiangqi card to root game list**
- Add new card link to `./xiangqi/`.

**Step 2: Run tests**
Run: `node --test xiangqi/tests/game-core.test.js xiangqi/tests/ai.test.js`
Expected: PASS.

**Step 3: Sanity-check file structure**
Run: `rg --files xiangqi | sort`
Expected: expected files present.

**Step 4: Commit**
```bash
git add index.html xiangqi docs/plans/2026-02-26-xiangqi-design.md docs/plans/2026-02-26-xiangqi-implementation.md
git commit -m "feat: add xiangqi mini game with pvp and ai"
```
