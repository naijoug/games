const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, scoreGuess, submitGuess } = require("../game-core.js");

test("scoreGuess separates exact matches from present digits", () => {
  assert.deepEqual(scoreGuess(["1", "2", "3", "4"], ["1", "4", "2", "0"]), {
    exact: 1,
    present: 2,
  });
});

test("submitGuess wins when all positions match", () => {
  const game = createGame({ secret: ["0", "1", "2", "3"] });
  const next = submitGuess(game, ["0", "1", "2", "3"]);

  assert.equal(next.status, "won");
  assert.equal(next.guesses.length, 1);
  assert.deepEqual(next.guesses[0].feedback, { exact: 4, present: 0 });
});

test("submitGuess loses after maximum failed attempts", () => {
  let game = createGame({ secret: ["0", "0", "0", "0"] });
  for (let i = 0; i < game.maxAttempts; i += 1) {
    game = submitGuess(game, ["1", "1", "1", "1"]);
  }

  assert.equal(game.status, "lost");
});

test("invalid guesses are ignored", () => {
  const game = createGame({ secret: ["0", "1", "2", "3"] });
  const next = submitGuess(game, ["0", "1"]);

  assert.equal(next, game);
});
