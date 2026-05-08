(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.HackerwordCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const WORDS = ["array", "cache", "debug", "shell", "stack", "token", "trace", "pixel", "query", "merge"];
  const MAX_ATTEMPTS = 6;

  function pickWord(randomFn = Math.random) {
    const index = Math.floor(randomFn() * WORDS.length);
    return WORDS[Math.max(0, Math.min(WORDS.length - 1, index))];
  }

  function createGame(options = {}) {
    const secret = (options.secret || pickWord(options.randomFn)).toLowerCase();
    return {
      secret,
      length: secret.length,
      guesses: [],
      maxAttempts: MAX_ATTEMPTS,
      status: "playing",
    };
  }

  function scoreGuess(secret, guess) {
    const result = Array(secret.length).fill("miss");
    const counts = new Map();

    for (let i = 0; i < secret.length; i += 1) {
      if (guess[i] === secret[i]) {
        result[i] = "hit";
      } else {
        counts.set(secret[i], (counts.get(secret[i]) || 0) + 1);
      }
    }

    for (let i = 0; i < guess.length; i += 1) {
      if (result[i] === "hit") {
        continue;
      }
      const count = counts.get(guess[i]) || 0;
      if (count > 0) {
        result[i] = "trace";
        counts.set(guess[i], count - 1);
      }
    }

    return result;
  }

  function isValidGuess(game, guess) {
    return typeof guess === "string" && /^[a-z]+$/i.test(guess) && guess.length === game.length;
  }

  function submitGuess(game, guess) {
    const normalized = String(guess || "").toLowerCase();
    if (game.status !== "playing" || !isValidGuess(game, normalized)) {
      return game;
    }

    const score = scoreGuess(game.secret, normalized);
    const guesses = [...game.guesses, { word: normalized, score }];
    let status = "playing";

    if (normalized === game.secret) {
      status = "won";
    } else if (guesses.length >= game.maxAttempts) {
      status = "lost";
    }

    return {
      ...game,
      guesses,
      status,
    };
  }

  return {
    WORDS,
    MAX_ATTEMPTS,
    createGame,
    pickWord,
    scoreGuess,
    submitGuess,
  };
});
