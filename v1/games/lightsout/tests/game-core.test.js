const test = require("node:test");
const assert = require("node:assert/strict");
const { createEmptyBoard, createGame, isSolved, toggleBoard, toggleCell } = require("../game-core.js");

test("toggleBoard flips selected cell and orthogonal neighbors", () => {
  const board = createEmptyBoard(3);
  const next = toggleBoard(board, 1, 1);

  assert.equal(next[1][1], true);
  assert.equal(next[0][1], true);
  assert.equal(next[2][1], true);
  assert.equal(next[1][0], true);
  assert.equal(next[1][2], true);
  assert.equal(next[0][0], false);
});

test("same toggle twice restores board", () => {
  const board = createEmptyBoard(3);
  const next = toggleBoard(toggleBoard(board, 1, 1), 1, 1);

  assert.deepEqual(next, board);
  assert.equal(isSolved(next), true);
});

test("toggleCell increments moves and wins when board clears", () => {
  const board = toggleBoard(createEmptyBoard(3), 1, 1);
  const game = createGame({ size: 3, board });
  const next = toggleCell(game, 1, 1);

  assert.equal(next.moves, 1);
  assert.equal(next.status, "won");
});
