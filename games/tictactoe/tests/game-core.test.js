const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, makeMove } = require("../game-core.js");

test("createGame initializes empty board and X turn", () => {
  const game = createGame();
  assert.equal(game.board.length, 9);
  assert.equal(game.current, "X");
  assert.equal(game.status, "playing");
  assert.equal(game.winner, null);
});

test("makeMove places mark and switches turn", () => {
  const game = createGame();
  const next = makeMove(game, 0);

  assert.equal(next.board[0], "X");
  assert.equal(next.current, "O");
  assert.equal(next.status, "playing");
});

test("makeMove ignores occupied cells", () => {
  const game = createGame();
  const first = makeMove(game, 0);
  const next = makeMove(first, 0);

  assert.deepEqual(next.board, first.board);
  assert.equal(next.current, first.current);
});

test("makeMove detects winner", () => {
  let game = createGame();
  game = makeMove(game, 0); // X
  game = makeMove(game, 3); // O
  game = makeMove(game, 1); // X
  game = makeMove(game, 4); // O
  game = makeMove(game, 2); // X wins

  assert.equal(game.status, "won");
  assert.equal(game.winner, "X");
});

test("makeMove detects draw", () => {
  let game = createGame();
  const sequence = [0, 1, 2, 4, 3, 5, 7, 6, 8];
  for (const move of sequence) {
    game = makeMove(game, move);
  }

  assert.equal(game.status, "draw");
  assert.equal(game.winner, null);
});
