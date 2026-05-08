(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CodebreakerCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const COLORS = ["0", "1", "2", "3", "4", "5"];
  const CODE_LENGTH = 4;
  const MAX_ATTEMPTS = 10;

  function makeSecret(randomFn = Math.random) {
    return Array.from({ length: CODE_LENGTH }, () => {
      const index = Math.floor(randomFn() * COLORS.length);
      return COLORS[Math.max(0, Math.min(COLORS.length - 1, index))];
    });
  }

  function createGame(options = {}) {
    const secret = Array.isArray(options.secret) ? options.secret.slice(0, CODE_LENGTH) : makeSecret(options.randomFn);
    return {
      secret,
      guesses: [],
      status: "playing",
      maxAttempts: MAX_ATTEMPTS,
    };
  }

  function scoreGuess(secret, guess) {
    const secretRemainder = [];
    const guessRemainder = [];
    let exact = 0;

    for (let i = 0; i < CODE_LENGTH; i += 1) {
      if (guess[i] === secret[i]) {
        exact += 1;
      } else {
        secretRemainder.push(secret[i]);
        guessRemainder.push(guess[i]);
      }
    }

    const counts = new Map();
    secretRemainder.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));

    let present = 0;
    guessRemainder.forEach((value) => {
      const count = counts.get(value) || 0;
      if (count > 0) {
        present += 1;
        counts.set(value, count - 1);
      }
    });

    return { exact, present };
  }

  function isValidGuess(guess) {
    return Array.isArray(guess) && guess.length === CODE_LENGTH && guess.every((value) => COLORS.includes(String(value)));
  }

  function submitGuess(game, guess) {
    if (game.status !== "playing" || !isValidGuess(guess)) {
      return game;
    }

    const normalizedGuess = guess.map(String);
    const feedback = scoreGuess(game.secret, normalizedGuess);
    const guesses = [...game.guesses, { guess: normalizedGuess, feedback }];
    let status = "playing";

    if (feedback.exact === CODE_LENGTH) {
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
    COLORS,
    CODE_LENGTH,
    MAX_ATTEMPTS,
    createGame,
    makeSecret,
    scoreGuess,
    submitGuess,
  };
});
