(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.HangmanCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const DEFAULT_WORDS = ["JAVASCRIPT", "BROWSER", "PUZZLE", "GAME", "CODING"];

  function chooseWord(words, randomFn) {
    const list = Array.isArray(words) && words.length > 0 ? words : DEFAULT_WORDS;
    const rawIndex = Math.floor(randomFn() * list.length);
    const index = Math.max(0, Math.min(list.length - 1, rawIndex));
    return String(list[index]).toUpperCase();
  }

  function createMask(word, guesses) {
    let out = "";
    for (const ch of word) {
      out += guesses.has(ch) ? ch : "_";
    }
    return out;
  }

  function createGame(options = {}) {
    const randomFn = typeof options.randomFn === "function" ? options.randomFn : Math.random;
    const word = chooseWord(options.words, randomFn);
    const maxWrong = Number.isInteger(options.maxWrong) ? options.maxWrong : 6;
    const guesses = new Set();

    return {
      word,
      guesses,
      wrongGuesses: [],
      remaining: maxWrong,
      maxWrong,
      mask: createMask(word, guesses),
      status: "playing",
    };
  }

  function guessLetter(game, input) {
    if (game.status !== "playing") {
      return game;
    }

    const letter = String(input || "").trim().slice(0, 1).toUpperCase();
    if (!/^[A-Z]$/.test(letter) || game.guesses.has(letter)) {
      return game;
    }

    const guesses = new Set(game.guesses);
    guesses.add(letter);
    const correct = game.word.includes(letter);
    const wrongGuesses = correct ? game.wrongGuesses.slice() : game.wrongGuesses.concat(letter);
    const remaining = correct ? game.remaining : Math.max(0, game.remaining - 1);
    const mask = createMask(game.word, guesses);

    let status = "playing";
    if (mask === game.word) {
      status = "won";
    } else if (remaining === 0) {
      status = "lost";
    }

    return {
      ...game,
      guesses,
      wrongGuesses,
      remaining,
      mask,
      status,
    };
  }

  return {
    createGame,
    guessLetter,
  };
});
