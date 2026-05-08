const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, fire, movePlayer, stepGame } = require("../game-core.js");

test("movePlayer clamps inside board", () => {
  let game = createGame({ playerCol: 0 });
  game = movePlayer(game, -20);
  assert.equal(game.playerCol, 0);

  game = movePlayer(game, 99);
  assert.equal(game.playerCol, game.width - 1);
});

test("fire creates one shot per player column", () => {
  const game = createGame({ playerCol: 4 });
  const next = fire(fire(game));

  assert.equal(next.shots.length, 1);
  assert.deepEqual(next.shots[0], { row: game.height - 3, col: 4 });
});

test("stepGame moves shots upward and scores hits", () => {
  const game = createGame({
    invaders: [{ row: 4, col: 4 }],
    shots: [{ row: 5, col: 4 }],
  });
  const next = stepGame(game);

  assert.equal(next.invaders.length, 0);
  assert.equal(next.score, 10);
  assert.equal(next.status, "won");
});

test("stepGame moves invaders every fourth tick", () => {
  let game = createGame({ invaders: [{ row: 1, col: 3 }], invaderDir: 1 });
  for (let i = 0; i < 4; i += 1) {
    game = stepGame(game);
  }

  assert.deepEqual(game.invaders[0], { row: 1, col: 4 });
});

test("stepGame loses when invaders reach bottom", () => {
  const game = createGame({ invaders: [{ row: 14, col: 3 }] });
  const next = stepGame(game);

  assert.equal(next.status, "lost");
});
