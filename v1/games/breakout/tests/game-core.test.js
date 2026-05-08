const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, movePaddle, stepGame } = require("../game-core.js");

test("movePaddle clamps inside board", () => {
  let game = createGame({ paddleX: 0 });
  game = movePaddle(game, -10);
  assert.equal(game.paddleX, 0);

  game = movePaddle(game, 20);
  assert.equal(game.paddleX, game.cols - game.paddleWidth);
});

test("stepGame removes a brick and scores on collision", () => {
  const bricks = Array.from({ length: 5 }, () => Array(10).fill(false));
  bricks[2][4] = true;
  const game = createGame({
    bricks,
    ball: { x: 4, y: 3, dx: 0, dy: -1 },
  });
  const next = stepGame(game);

  assert.equal(next.bricks[2][4], false);
  assert.equal(next.score, 10);
});

test("stepGame loses a life when ball exits bottom", () => {
  const game = createGame({
    ball: { x: 5, y: 13, dx: 0, dy: 1 },
  });
  const next = stepGame(game);

  assert.equal(next.lives, 2);
  assert.equal(next.status, "playing");
});

test("stepGame marks win after final brick", () => {
  const bricks = Array.from({ length: 5 }, () => Array(10).fill(false));
  bricks[2][4] = true;
  const game = createGame({
    bricks,
    ball: { x: 4, y: 3, dx: 0, dy: -1 },
  });
  const next = stepGame(game);

  assert.equal(next.status, "won");
});
