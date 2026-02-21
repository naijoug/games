# Mini Games

This repository contains small browser games.

## Online

- Home: https://naijoug.github.io/games/
- 2048: https://naijoug.github.io/games/2048/
- Snake: https://naijoug.github.io/games/snake/

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
