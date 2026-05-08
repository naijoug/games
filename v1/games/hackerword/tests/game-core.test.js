const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, scoreGuess, submitGuess } = require("../game-core.js");

test("scoreGuess marks hits before traces", () => {
  assert.deepEqual(scoreGuess("array", "allay"), ["hit", "miss", "miss", "hit", "hit"]);
});

test("submitGuess accepts case-insensitive valid guesses", () => {
  const game = createGame({ secret: "trace" });
  const next = submitGuess(game, "TRACE");

  assert.equal(next.status, "won");
  assert.equal(next.guesses[0].word, "trace");
});

test("submitGuess rejects wrong length guesses", () => {
  const game = createGame({ secret: "trace" });
  const next = submitGuess(game, "traces");

  assert.equal(next, game);
});

test("submitGuess loses after max attempts", () => {
  let game = createGame({ secret: "trace" });
  for (let i = 0; i < game.maxAttempts; i += 1) {
    game = submitGuess(game, "array");
  }

  assert.equal(game.status, "lost");
});
