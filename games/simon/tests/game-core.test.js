const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, startRound, inputColor } = require("../game-core.js");

test("startRound adds one color to sequence and resets input index", () => {
  const game = createGame();
  const next = startRound(game, () => 0);

  assert.deepEqual(next.sequence, ["green"]);
  assert.equal(next.inputIndex, 0);
  assert.equal(next.status, "input");
});

test("inputColor advances through correct sequence", () => {
  let game = createGame({ sequence: ["green", "red"], status: "input", round: 2 });
  game = inputColor(game, "green");
  assert.equal(game.inputIndex, 1);
  assert.equal(game.status, "input");

  game = inputColor(game, "red");
  assert.equal(game.status, "round-complete");
  assert.equal(game.score, 2);
});

test("inputColor marks game over on mismatch", () => {
  const game = createGame({ sequence: ["green"], status: "input", round: 1 });
  const next = inputColor(game, "blue");

  assert.equal(next.status, "game-over");
  assert.equal(next.score, 0);
});

test("startRound after completion increments round", () => {
  let game = createGame();
  game = startRound(game, () => 0);
  game = inputColor(game, "green");
  game = startRound(game, () => 0.99);

  assert.equal(game.round, 2);
  assert.equal(game.sequence.length, 2);
});
