(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SimonCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const COLORS = ["green", "red", "yellow", "blue"];

  function createGame(initial = {}) {
    return {
      mode: initial.mode === "kids" ? "kids" : "classic",
      sequence: Array.isArray(initial.sequence) ? initial.sequence.slice() : [],
      status: initial.status || "idle",
      round: Number.isInteger(initial.round) ? initial.round : 0,
      score: Number.isInteger(initial.score) ? initial.score : 0,
      inputIndex: Number.isInteger(initial.inputIndex) ? initial.inputIndex : 0,
    };
  }

  function pickColor(randomFn = Math.random) {
    const raw = Math.floor(randomFn() * COLORS.length);
    const index = Math.max(0, Math.min(COLORS.length - 1, raw));
    return COLORS[index];
  }

  function startRound(game, randomFn = Math.random) {
    if (!["idle", "round-complete"].includes(game.status)) {
      return game;
    }

    const sequence = game.sequence.concat(pickColor(randomFn));
    return {
      ...game,
      sequence,
      round: sequence.length,
      inputIndex: 0,
      status: "input",
    };
  }

  function inputColor(game, color) {
    if (game.status !== "input" || !COLORS.includes(color)) {
      return game;
    }

    const expected = game.sequence[game.inputIndex];
    if (color !== expected) {
      return {
        ...game,
        status: game.mode === "kids" ? "retry" : "game-over",
      };
    }

    const nextIndex = game.inputIndex + 1;
    if (nextIndex >= game.sequence.length) {
      return {
        ...game,
        inputIndex: 0,
        score: game.sequence.length,
        status: game.mode === "kids" && game.sequence.length >= 6 ? "won" : "round-complete",
      };
    }

    return {
      ...game,
      inputIndex: nextIndex,
    };
  }

  function replayRound(game) {
    if (game.mode !== "kids" || !["input", "retry"].includes(game.status)) return game;
    return { ...game, inputIndex: 0, status: "input" };
  }

  return {
    replayRound,
    COLORS,
    createGame,
    startRound,
    inputColor,
  };
});
