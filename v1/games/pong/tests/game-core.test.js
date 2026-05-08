const test = require("node:test");
const assert = require("node:assert/strict");
const { WIN_SCORE, createGame, movePlayer, stepGame } = require("../game-core.js");

test("movePlayer clamps to board", () => {
  let game = createGame({ playerY: 0 });
  game = movePlayer(game, -20);
  assert.equal(game.playerY, 0);

  game = movePlayer(game, 99);
  assert.equal(game.playerY, game.height - game.paddleHeight);
});

test("stepGame bounces from player paddle", () => {
  const game = createGame({
    playerY: 5,
    ball: { x: 2, y: 6, dx: -1, dy: 0 },
  });
  const next = stepGame(game);

  assert.equal(next.ball.dx, 1);
});

test("stepGame scores for cpu when ball exits left", () => {
  const game = createGame({
    ball: { x: 0, y: 0, dx: -1, dy: 0 },
  });
  const next = stepGame(game);

  assert.equal(next.cpuScore, 1);
});

test("game ends when player reaches win score", () => {
  const game = createGame({
    playerScore: WIN_SCORE - 1,
    ball: { x: 27, y: 0, dx: 1, dy: 0 },
  });
  const next = stepGame(game);

  assert.equal(next.playerScore, WIN_SCORE);
  assert.equal(next.status, "won");
});
