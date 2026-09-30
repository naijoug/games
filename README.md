# Mini Games

This repository contains small browser games.

## Online

- [Home](https://naijoug.github.io/games/)
- [2048](https://naijoug.github.io/games/games/2048/)
- [Breakout](https://naijoug.github.io/games/games/breakout/)
- [Snake](https://naijoug.github.io/games/games/snake/)
- [Tic Tac Toe](https://naijoug.github.io/games/games/tictactoe/)
- [Minesweeper](https://naijoug.github.io/games/games/minesweeper/)
- [Memory Match](https://naijoug.github.io/games/games/memory/)
- [Connect Four](https://naijoug.github.io/games/games/connect4/)
- [Hangman](https://naijoug.github.io/games/games/hangman/)
- [Hackerword](https://naijoug.github.io/games/games/hackerword/)
- [Invaders](https://naijoug.github.io/games/games/invaders/)
- [Simon](https://naijoug.github.io/games/games/simon/)
- [Chess Arena](https://naijoug.github.io/games/games/chess/)
- [Codebreaker](https://naijoug.github.io/games/games/codebreaker/)
- [Lights Out](https://naijoug.github.io/games/games/lightsout/)
- [Pong](https://naijoug.github.io/games/games/pong/)
- [Sokoban](https://naijoug.github.io/games/games/sokoban/)
- [Xiangqi](https://naijoug.github.io/games/games/xiangqi/)

- [迷宫寻路](https://naijoug.github.io/games/games/maze/)

- [图形规律](https://naijoug.github.io/games/games/patterns/)

- [四宫格数独](https://naijoug.github.io/games/games/sudoku/)

- [七巧板](https://naijoug.github.io/games/games/tangram/)

- [小车解堵](https://naijoug.github.io/games/games/traffic/)

- [对称画画](https://naijoug.github.io/games/games/symmetry/)

## Development

Use Node.js 22 (matching CI); no npm dependencies or installation step are needed.
For a local HTTP preview, use Python 3 from the repository root:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [the local homepage](http://127.0.0.1:8000/) or
[a game](http://127.0.0.1:8000/games/2048/).
Current sources live in `games/`; `v1/` is a published historical snapshot and is not
synchronized with current game changes.

```bash
# One game's rules and helpers
node --test games/2048/tests/*.test.js

# All current games and site tooling (also run by CI)
node --test games/*/tests/*.test.js scripts/tests/*.test.js

# Package the site, then validate its local links and the Online catalog above
node scripts/build-site.js
node scripts/check-site.js

# Preview the packaged site locally
python3 -m http.server 8000 --bind 127.0.0.1 --directory _site
```

The build recreates `_site/` from current sources without rewriting them. It keeps
`games/`, `src/`, and `v1/` in place, excluding tests and `.pen` design files.
The link check resolves static HTML `href`/`src` attributes under the production
`/games/` base path, checks every current game's homepage/README entry, and includes
legacy HTML pages. It does not execute browser JavaScript or check remote services.

| Change | Verification |
| --- | --- |
| Documentation | Check affected paths, links, and commands; no game tests needed for prose-only edits |
| One game's rules or helpers | Run that game's tests; cover behavior and edge cases changed by the task |
| UI or styles | Inspect the affected desktop/mobile layout and interaction in a browser |
| Shared resources, navigation, or deployment | Run the full current test suite, build, and check the site; inspect affected UI when applicable |
| Historical `v1/` runtime | Run the affected legacy game's tests explicitly |

After relevant checks pass, repeat or broaden verification only for new changes,
failures, or unresolved concerns. Node tests and static link checks do not establish
that browser interactions work.

Pull requests run validation only. Pushes to `main` and manual workflow runs deploy
the validated artifact through GitHub Pages. The repository's Pages source should
be **GitHub Actions**. The project base `/games/` plus the source directory `games/`
produces published game routes such as `/games/games/2048/`.

For historical layout experiments only, `node scripts/preview-v1-migration.js`
recreates `_migration-preview/` using `v1` game content. Serve that directory with
the same Python command if needed. It is separate from normal builds and deployment;
review any generated changes before copying them into current sources.

- [Project guidance](AGENTS.md)
- [Architecture and deployment](docs/project-functional-architecture.md)
- [Historical plans and future plan format](docs/plans/README.md)

## 2048

### Goal

Merge tiles and reach `2048` on the board.

### Controls

- Keyboard: `Arrow Keys` or `W / A / S / D`
- Mobile: swipe up/down/left/right

### Rules

- The board is `4 x 4`.
- Every valid move slides tiles in one direction.
- Tiles with the same number merge into one tile.
- A merged tile value is doubled (for example `2 + 2 = 4`).
- After each valid move, a new tile appears.

### Scoring

Your score increases by the value of merged tiles.

### Win / Lose

- Win when a `2048` tile appears.
- Lose when no valid moves remain.

## Snake

### Goal

Eat food to grow while avoiding walls and your own body.

### Controls

- Keyboard: `Arrow Keys` or `W / A / S / D`
- Pause/Resume: `Space`
- Mobile: on-screen direction buttons

### Rules

- The board is `16 x 16`.
- The snake moves one cell every tick.
- Eating food grows the snake by `1` and adds `1` score.
- The game ends when the snake hits a wall or itself.
- Use `Restart` or `Play Again` to start over.

## Breakout

### Goal

Clear every firewall brick by keeping the packet ball in play.

### Controls

- Keyboard: `Arrow Left / Arrow Right` or `A / D`
- Mobile: on-screen `Left` and `Right` buttons

### Rules

- The paddle sits near the bottom of the terminal grid.
- Each brick hit adds `10` score.
- Missing the ball costs one life.
- Clear all bricks to win; lose all lives to end the run.

## Codebreaker

### Goal

Crack the hidden four-digit code before lockout.

### Controls

- Keyboard: digits `0-5`, `Backspace`, and `Enter`
- Mouse/touch: digit buttons, current code strip, and submit button

### Rules

- Digits can repeat.
- Each guess returns exact matches and present-but-wrong-position traces.
- You have `10` attempts.
- The secret is revealed after win or loss.

## Lights Out

### Goal

Turn off every glowing node on the grid.

### Controls

- Click/tap any cell to toggle it

### Rules

- Toggling a cell flips that cell plus its orthogonal neighbors.
- The puzzle is generated from reversible moves, so every grid is solvable.
- Win when the whole grid is dark.

## Pong

### Goal

Beat the CPU paddle daemon to `7` points.

### Controls

- Keyboard: `Arrow Up / Arrow Down` or `W / S`
- Mobile: on-screen `Up` and `Down` buttons

### Rules

- The CPU paddle tracks the ball one row per tick.
- Score when the ball passes the CPU side.
- First side to `7` points wins.

## Hackerword

### Goal

Guess the hidden five-letter command in six attempts.

### Controls

- Keyboard: type a word and press `Enter`
- Mouse/touch: input field plus `Probe` button

### Rules

- Green tiles are exact letter positions.
- Amber tiles are letters present elsewhere in the word.
- The secret is revealed after win or loss.

## Invaders

### Goal

Destroy the descending packet wave before it reaches the terminal base.

### Controls

- Keyboard: `Arrow Left / Arrow Right` or `A / D`
- Fire: `Space`, `Arrow Up`, or `W`
- Mobile: on-screen buttons

### Rules

- Shots travel upward one row per tick.
- Enemy packets move sideways and drop when they hit an edge.
- Destroy all packets to win; let them reach the base to lose.

## Sokoban

### Goal

Push every payload crate onto a target node.

### Controls

- Keyboard: `Arrow Keys` or `W / A / S / D`
- Mobile: on-screen direction buttons

### Rules

- You can push one crate at a time.
- Crates cannot move through walls or other crates.
- Complete a level by placing all crates on targets.

## Tic Tac Toe

### Goal

Get three of your marks in a row.

### Controls

- Click a cell to place mark
- Local 2-player turns (`X` then `O`)

### Rules

- Board size is `3 x 3`.
- First player to connect 3 wins.
- If board fills without winner, game is a draw.

## Minesweeper

### Goal

Reveal all safe cells without clicking a mine.

### Controls

- Left click: reveal cell
- Right click: flag/unflag cell

### Rules

- Board size is `9 x 9`.
- Mine count is `10`.
- Revealing a mine loses immediately.
- Revealing all safe cells wins.

## Memory Match

### Goal

Find and match all card pairs.

### Controls

- Click cards to flip two at a time

### Rules

- Board size is `4 x 4` (`8` pairs).
- Matching pair stays open.
- Non-matching pair flips back after a short delay.
- Matching all pairs wins.

## Connect Four

### Goal

Drop discs and connect `4` in a row before your opponent.

### Controls

- Click any column cell to drop a disc
- Local 2-player turns (`Red` / `Yellow`)

### Rules

- Board size is `7 x 6`.
- Discs fall to the lowest empty slot in a column.
- Connect 4 horizontally, vertically, or diagonally to win.
- Full board with no winner is a draw.

## Hangman

### Goal

Guess the hidden word before attempts run out.

### Controls

- Keyboard: `A-Z`
- Mouse/touch: on-screen letter keyboard

### Rules

- Repeated guesses are ignored.
- Correct guesses reveal all matching letters.
- Wrong guesses reduce remaining attempts.
- Reach `0` attempts and the round is lost.

## Simon

### Goal

Repeat the color sequence as it grows each round.

### Controls

- Click colored pads
- Keyboard shortcuts: `G / R / Y / B`

### Rules

- Start a round to watch the sequence playback.
- Repeat the full sequence in order.
- A wrong input ends the game.
- Score equals the completed sequence length.

## Chess Arena

### Modes

- Local PvP (same-device two-player)
- Human vs AI (alpha-beta search with selectable depth)
- Puzzle Challenge (`mate in 1`, `mate in 2`, `mate in 3`)
- Classic Game Lessons (annotated move playback, categorized by chapter)

### Controls

- Click a piece, then click a highlighted target square to move
- Use the left-side panel to switch modes and manage puzzle/lesson progress
- `Reset` restarts the current mode
- `Copy FEN` copies the current position for analysis/sharing

### Notes

- Bundles a local `chess.js` browser build for legal moves, check/checkmate and notation
- Pawn promotion supports piece selection (`Q / R / B / N`)
- Puzzle mode includes progressive hints, scoring, stars/grades, and local progress persistence (`localStorage`)
- Lesson mode tracks local study progress and supports chapter filtering (including Capablanca / Fischer / Kasparov teaching fragments)


## Xiangqi

### Modes and controls

- Local two-player games or human vs AI with three difficulty levels
- Click a piece and a legal destination to move
- Choose your side, undo moves, or restart from the control panel

The rules engine handles legal moves and endgame detection. Repeated-position
adjudication approximates common perpetual-check/chase cases; ambiguous repetitions
fall back to a draw.

## 迷宫寻路

18 关方向与路线挑战，支持撤销和当前位置提示。中文说明，支持鼠标、触摸和键盘，关卡进度保存在本地；无需账号。具体规则见游戏页面。

## 图形规律

24 道重复、缺项和双属性规律题。中文说明，支持鼠标、触摸和键盘，关卡进度保存在本地；无需账号。具体规则见游戏页面。

## 四宫格数独

24 道动物或数字数独，可解释提示与撤销。中文说明，支持鼠标、触摸和键盘，关卡进度保存在本地；无需账号。具体规则见游戏页面。

## 七巧板

12 个七块拼搭目标，拖动或按钮操作、旋转与翻面。中文说明，支持鼠标、触摸和键盘，关卡进度保存在本地；无需账号。具体规则见游戏页面。

## 小车解堵

18 关车辆规划，支持拖动、撤销与当前局面提示。中文说明，支持鼠标、触摸和键盘，关卡进度保存在本地；无需账号。具体规则见游戏页面。

## 对称画画

18 个水平与竖直镜像图案，涂格、擦除和撤销。中文说明，支持鼠标、触摸和键盘，关卡进度保存在本地；无需账号。具体规则见游戏页面。
