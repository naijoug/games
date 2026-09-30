(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SymmetryCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function mirror(level, i) {
    const n = level.size,
      r = Math.floor(i / n),
      c = i % n;
    return level.axis === "vertical" ? r * n + n - 1 - c : (n - 1 - r) * n + c;
  }
  function createGame(level) {
    return {
      level,
      cells: level.target.map((v, i) => (level.readonly.includes(i) ? v : 0)),
      history: [],
      status: "playing",
    };
  }
  function paintCell(s, i, color) {
    if (
      !Number.isInteger(i) ||
      i < 0 ||
      i >= s.cells.length ||
      !Number.isInteger(color) ||
      color < 0 ||
      color > 3 ||
      s.level.readonly.includes(i) ||
      s.cells[i] === color
    )
      return s;
    const cells = s.cells.slice();
    cells[i] = color;
    return { ...s, cells, history: [...s.history, s.cells], status: "playing" };
  }
  function undo(s) {
    return s.history.length
      ? {
          ...s,
          cells: s.history.at(-1),
          history: s.history.slice(0, -1),
          status: "playing",
        }
      : s;
  }
  function checkAnswer(s) {
    return {
      ...s,
      status: s.cells.every((v, i) => v === s.level.target[i])
        ? "won"
        : "playing",
    };
  }
  function getHint(s) {
    const index = s.cells.findIndex((v, i) => v !== s.level.target[i]);
    return index < 0 ? null : { index, source: mirror(s.level, index) };
  }
  return {
    mirror,
    createGame,
    paintCell,
    eraseCell: (s, i) => paintCell(s, i, 0),
    undo,
    checkAnswer,
    getHint,
  };
});
