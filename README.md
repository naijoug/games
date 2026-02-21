# Mini Games

This repository contains small browser games.

## Online

- Home: https://naijoug.github.io/games/
- 2048: https://naijoug.github.io/games/2048/
- Snake: https://naijoug.github.io/games/snake/
- Tic Tac Toe: https://naijoug.github.io/games/tictactoe/
- Minesweeper: https://naijoug.github.io/games/minesweeper/
- Memory Match: https://naijoug.github.io/games/memory/

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
