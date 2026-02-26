# Chess Arena Enhancements Design (Progress, Content, UX)

## Scope

Extend the existing chess module with:
- Puzzle progression by difficulty with hints, failure feedback, scoring, and local persistence
- More classic lessons (Capablanca, Fischer, Kasparov) plus lesson categorization/filtering
- UX upgrades: move animations, promotion piece icons, AI thinking progress bar

## Architecture

Keep `chess.js` integration and main mode orchestration in `chess/app.js`, but move persistence/scoring into a new pure module `chess/progress-core.js` (UMD + Node-testable). Extend `chess/content.js` schema to include richer metadata rather than introducing a new content format.

## Data Model Changes

### Puzzles
Each puzzle gains:
- `difficulty`: `easy|medium|hard`
- `tags`: string[]
- `hints`: string[] (ordered, progressive hints)
- `baseScore`: number
- `parSeconds`: number

### Lessons
Each lesson gains:
- `section`: category bucket (`opening-attack`, `positional-play`, `endgame-technique`, etc.)
- `players`: string
- `era`: string
- `tags`: string[]

## Progress & Scoring

`progress-core.js` stores `chessArena.progress.v1` in `localStorage`:
- puzzle stats by `puzzleId`: best score, best stars, grade, attempts, clears, fails, hints used, fastest clear
- lesson stats by `lessonId`: viewed flag, max step reached, completed flag, last viewed timestamp
- profile aggregates: total puzzle clears, total score, last played mode

Scoring formula (deterministic):
- Start with `baseScore`
- Bonus: first clear, no mistakes, no hints, time bonus relative to `parSeconds`
- Penalty: wrong attempts and hints used
- Clamp at minimum score floor
- Convert to `stars (1..3)` and `grade (S/A/B/C)` by score ratio

## UX Enhancements

- Puzzle panel shows score preview/current run stats, hint button, failure count, best record
- Lesson panel adds category filter and grouped labels
- AI panel shows indeterminate progress bar + elapsed thinking time
- Board moves get short CSS transition via piece overlay/animated glyph (lightweight DOM-based animation)
- Promotion picker buttons display chess glyph icons (color-aware)

## Error Handling

- Missing/invalid localStorage: fall back to in-memory state and warn non-blockingly
- Legacy saved data: version-gated migration/fallback reset
- Invalid lesson/puzzle metadata: fail gracefully and surface in existing error banner

## Testing

- `progress-core` unit tests (score calc, persistence roundtrip, merge semantics)
- `content` tests extended for new metadata schema + category coverage + expanded lessons
- `index.html` and smoke syntax checks retained
