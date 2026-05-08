# Mini Games

This repository contains small browser games.

## Online

- Home: https://naijoug.github.io/games/
- 2048: https://naijoug.github.io/games/2048/
- Breakout: https://naijoug.github.io/games/breakout/
- Snake: https://naijoug.github.io/games/snake/
- Tic Tac Toe: https://naijoug.github.io/games/tictactoe/
- Minesweeper: https://naijoug.github.io/games/minesweeper/
- Memory Match: https://naijoug.github.io/games/memory/
- Connect Four: https://naijoug.github.io/games/connect4/
- Hangman: https://naijoug.github.io/games/hangman/
- Hackerword: https://naijoug.github.io/games/hackerword/
- Invaders: https://naijoug.github.io/games/invaders/
- Simon: https://naijoug.github.io/games/simon/
- Chess Arena: https://naijoug.github.io/games/chess/
- Codebreaker: https://naijoug.github.io/games/codebreaker/
- Lights Out: https://naijoug.github.io/games/lightsout/
- Pong: https://naijoug.github.io/games/pong/
- Sokoban: https://naijoug.github.io/games/sokoban/

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
