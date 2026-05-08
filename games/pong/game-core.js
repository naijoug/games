(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PongCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const WIDTH = 28;
  const HEIGHT = 16;
  const PADDLE_HEIGHT = 4;
  const WIN_SCORE = 7;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function centerPaddle() {
    return Math.floor((HEIGHT - PADDLE_HEIGHT) / 2);
  }

  function createBall(direction = 1) {
    return {
      x: Math.floor(WIDTH / 2),
      y: Math.floor(HEIGHT / 2),
      dx: direction,
      dy: -1,
    };
  }

  function createGame(options = {}) {
    return {
      width: WIDTH,
      height: HEIGHT,
      paddleHeight: PADDLE_HEIGHT,
      playerY: Number.isInteger(options.playerY) ? options.playerY : centerPaddle(),
      cpuY: Number.isInteger(options.cpuY) ? options.cpuY : centerPaddle(),
      ball: options.ball ? { ...options.ball } : createBall(),
      playerScore: options.playerScore || 0,
      cpuScore: options.cpuScore || 0,
      status: "playing",
    };
  }

  function movePlayer(game, delta) {
    if (game.status !== "playing") {
      return game;
    }

    return {
      ...game,
      playerY: clamp(game.playerY + delta, 0, game.height - game.paddleHeight),
    };
  }

  function moveCpu(game) {
    const target = game.ball.y - Math.floor(game.paddleHeight / 2);
    const delta = target > game.cpuY ? 1 : target < game.cpuY ? -1 : 0;
    return clamp(game.cpuY + delta, 0, game.height - game.paddleHeight);
  }

  function withinPaddle(y, paddleY, paddleHeight) {
    return y >= paddleY && y < paddleY + paddleHeight;
  }

  function afterScore(game, scorer) {
    const playerScore = game.playerScore + (scorer === "player" ? 1 : 0);
    const cpuScore = game.cpuScore + (scorer === "cpu" ? 1 : 0);
    const status = playerScore >= WIN_SCORE ? "won" : cpuScore >= WIN_SCORE ? "lost" : "playing";

    return {
      ...game,
      playerScore,
      cpuScore,
      status,
      ball: createBall(scorer === "player" ? -1 : 1),
    };
  }

  function stepGame(game) {
    if (game.status !== "playing") {
      return game;
    }

    let { x, y, dx, dy } = game.ball;
    let cpuY = moveCpu(game);
    let nextX = x + dx;
    let nextY = y + dy;

    if (nextY < 0 || nextY >= game.height) {
      dy *= -1;
      nextY = y + dy;
    }

    if (nextX === 1 && withinPaddle(nextY, game.playerY, game.paddleHeight)) {
      dx = 1;
      nextX = x + dx;
    }

    if (nextX === game.width - 2 && withinPaddle(nextY, cpuY, game.paddleHeight)) {
      dx = -1;
      nextX = x + dx;
    }

    if (nextX < 0) {
      return afterScore({ ...game, cpuY }, "cpu");
    }

    if (nextX >= game.width) {
      return afterScore({ ...game, cpuY }, "player");
    }

    return {
      ...game,
      cpuY,
      ball: { x: nextX, y: nextY, dx, dy },
    };
  }

  return {
    WIDTH,
    HEIGHT,
    PADDLE_HEIGHT,
    WIN_SCORE,
    createGame,
    movePlayer,
    stepGame,
  };
});
