(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BreakoutCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const COLS = 10;
  const ROWS = 14;
  const BRICK_ROWS = 5;
  const PADDLE_WIDTH = 3;

  function createBricks() {
    return Array.from({ length: BRICK_ROWS }, () => Array(COLS).fill(true));
  }

  function cloneBricks(bricks) {
    return bricks.map((row) => row.slice());
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createBall() {
    return { x: Math.floor(COLS / 2), y: ROWS - 4, dx: 1, dy: -1 };
  }

  function createGame(options = {}) {
    return {
      cols: COLS,
      rows: ROWS,
      bricks: options.bricks ? cloneBricks(options.bricks) : createBricks(),
      paddleX: Number.isInteger(options.paddleX) ? options.paddleX : Math.floor((COLS - PADDLE_WIDTH) / 2),
      paddleWidth: PADDLE_WIDTH,
      ball: options.ball ? { ...options.ball } : createBall(),
      score: 0,
      lives: 3,
      status: "playing",
    };
  }

  function movePaddle(game, delta) {
    if (game.status !== "playing") {
      return game;
    }

    return {
      ...game,
      paddleX: clamp(game.paddleX + delta, 0, game.cols - game.paddleWidth),
    };
  }

  function hasBricks(bricks) {
    return bricks.some((row) => row.some(Boolean));
  }

  function resetBall(game) {
    return {
      ...game,
      ball: createBall(),
      paddleX: Math.floor((game.cols - game.paddleWidth) / 2),
    };
  }

  function stepGame(game) {
    if (game.status !== "playing") {
      return game;
    }

    let { x, y, dx, dy } = game.ball;
    let nextX = x + dx;
    let nextY = y + dy;
    let bricks = game.bricks;
    let score = game.score;

    if (nextX < 0 || nextX >= game.cols) {
      dx *= -1;
      nextX = x + dx;
    }

    if (nextY < 0) {
      dy *= -1;
      nextY = y + dy;
    }

    if (nextY >= 0 && nextY < bricks.length && bricks[nextY][nextX]) {
      bricks = cloneBricks(bricks);
      bricks[nextY][nextX] = false;
      score += 10;
      dy = Math.abs(dy);
      nextY = y + dy;
    }

    const paddleY = game.rows - 2;
    if (nextY === paddleY && nextX >= game.paddleX && nextX < game.paddleX + game.paddleWidth) {
      const hit = nextX - game.paddleX;
      dx = hit === 0 ? -1 : hit === game.paddleWidth - 1 ? 1 : dx;
      dy = -1;
      nextY = y + dy;
      nextX = x + dx;
    }

    if (nextY >= game.rows) {
      const lives = game.lives - 1;
      if (lives <= 0) {
        return {
          ...game,
          lives: 0,
          status: "lost",
        };
      }
      return resetBall({ ...game, lives });
    }

    if (!hasBricks(bricks)) {
      return {
        ...game,
        bricks,
        score,
        ball: { x: nextX, y: nextY, dx, dy },
        status: "won",
      };
    }

    return {
      ...game,
      bricks,
      score,
      ball: { x: nextX, y: nextY, dx, dy },
    };
  }

  return {
    COLS,
    ROWS,
    BRICK_ROWS,
    createGame,
    movePaddle,
    stepGame,
  };
});
