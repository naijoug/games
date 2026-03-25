const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, dropDisc } = require("../game-core.js");

test("createGame initializes empty 7x6 board", () => {
  const game = createGame();
  assert.equal(game.rows, 6);
  assert.equal(game.cols, 7);
  assert.equal(game.board.length, 6);
  assert.equal(game.board[0].length, 7);
  assert.equal(game.current, "R");
  assert.equal(game.status, "playing");
});

test("dropDisc places disc at bottom and switches turn", () => {
  const game = createGame();
  const next = dropDisc(game, 0);

  assert.equal(next.board[5][0], "R");
  assert.equal(next.current, "Y");
});

test("dropDisc stacks discs in same column", () => {
  let game = createGame();
  game = dropDisc(game, 0);
  game = dropDisc(game, 0);

  assert.equal(game.board[5][0], "R");
  assert.equal(game.board[4][0], "Y");
});

test("dropDisc detects horizontal win", () => {
  let game = createGame();
  game = dropDisc(game, 0); // R
  game = dropDisc(game, 0); // Y
  game = dropDisc(game, 1); // R
  game = dropDisc(game, 1); // Y
  game = dropDisc(game, 2); // R
  game = dropDisc(game, 2); // Y
  game = dropDisc(game, 3); // R wins

  assert.equal(game.status, "won");
  assert.equal(game.winner, "R");
});

test("dropDisc ignores full column", () => {
  let game = createGame();
  for (let i = 0; i < 6; i += 1) {
    game = dropDisc(game, 0);
  }
  const before = game;
  const next = dropDisc(game, 0);

  assert.deepEqual(next.board, before.board);
  assert.equal(next.current, before.current);
});
