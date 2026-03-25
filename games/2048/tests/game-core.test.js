const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createGame,
  move,
  hasAvailableMoves,
  isWinningBoard,
} = require("../game-core.js");

function makeGame(board, score = 0) {
  return { board, score, won: false, over: false };
}

test("createGame starts with exactly two tiles", () => {
  const game = createGame(() => 0);
  const nonZero = game.board.flat().filter((n) => n !== 0);
  assert.equal(nonZero.length, 2);
});

test("move left merges once per pair and updates score", () => {
  const game = makeGame([
    [2, 2, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);

  const next = move(game, "left", () => 0.9999);
  assert.deepEqual(next.board[0], [4, 2, 0, 0]);
  assert.equal(next.score, 4);
});

test("move without board change does not spawn new tile", () => {
  const board = [
    [2, 4, 8, 16],
    [32, 64, 128, 256],
    [512, 1024, 2, 4],
    [8, 16, 32, 64],
  ];
  const game = makeGame(board, 0);
  const next = move(game, "left", () => 0.75);

  assert.deepEqual(next.board, board);
  assert.equal(next.score, 0);
});

test("hasAvailableMoves detects when game is blocked", () => {
  const blocked = [
    [2, 4, 8, 16],
    [32, 64, 128, 256],
    [512, 1024, 2, 4],
    [8, 16, 32, 64],
  ];

  const playable = [
    [2, 4, 8, 16],
    [32, 64, 128, 256],
    [512, 1024, 2, 2],
    [8, 16, 32, 64],
  ];

  assert.equal(hasAvailableMoves(blocked), false);
  assert.equal(hasAvailableMoves(playable), true);
});

test("isWinningBoard detects 2048 tile", () => {
  assert.equal(
    isWinningBoard([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4],
      [8, 16, 32, 64],
    ]),
    true,
  );
});
