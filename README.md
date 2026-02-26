# Mini Games

This repository contains small browser games.

## Online

- Home: https://naijoug.github.io/games/
- 2048: https://naijoug.github.io/games/2048/
- Snake: https://naijoug.github.io/games/snake/
- Tic Tac Toe: https://naijoug.github.io/games/tictactoe/
- Minesweeper: https://naijoug.github.io/games/minesweeper/
- Memory Match: https://naijoug.github.io/games/memory/
- Connect Four: https://naijoug.github.io/games/connect4/
- Hangman: https://naijoug.github.io/games/hangman/
- Simon: https://naijoug.github.io/games/simon/
- Chess Arena: https://naijoug.github.io/games/chess/

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
- Classic Game Lessons (annotated move playback)

### Controls

- Click a piece, then click a highlighted target square to move
- Use the left-side panel to switch modes and manage puzzle/lesson progress
- `Reset` restarts the current mode
- `Copy FEN` copies the current position for analysis/sharing

### Notes

- Bundles a local `chess.js` browser build for legal moves, check/checkmate and notation
- Pawn promotion defaults to queen (`Q`)
