const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, guessLetter } = require("../game-core.js");

test("createGame picks a word and initializes hidden mask", () => {
  const game = createGame({ words: ["CODE"], randomFn: () => 0 });
  assert.equal(game.word, "CODE");
  assert.equal(game.mask, "____");
  assert.equal(game.status, "playing");
  assert.equal(game.remaining, 6);
});

test("guessLetter reveals all matching letters", () => {
  let game = createGame({ words: ["APPLE"], randomFn: () => 0 });
  game = guessLetter(game, "P");

  assert.equal(game.mask, "_PP__");
  assert.equal(game.remaining, 6);
  assert.equal(game.guesses.has("P"), true);
});

test("guessLetter decrements remaining for wrong guess", () => {
  let game = createGame({ words: ["APPLE"], randomFn: () => 0 });
  game = guessLetter(game, "Z");

  assert.equal(game.remaining, 5);
  assert.equal(game.mask, "_____");
});

test("guessLetter wins when all letters guessed", () => {
  let game = createGame({ words: ["HI"], randomFn: () => 0 });
  game = guessLetter(game, "H");
  game = guessLetter(game, "I");

  assert.equal(game.status, "won");
  assert.equal(game.mask, "HI");
});

test("guessLetter loses when remaining reaches zero", () => {
  let game = createGame({ words: ["A"], randomFn: () => 0, maxWrong: 2 });
  game = guessLetter(game, "B");
  game = guessLetter(game, "C");

  assert.equal(game.status, "lost");
  assert.equal(game.remaining, 0);
});
