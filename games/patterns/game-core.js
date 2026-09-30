(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PatternCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function createGame(level) {
    return { level, status: "playing", attempts: 0, choice: null, hints: 0 };
  }
  function answer(s, id) {
    if (s.status === "won" || !s.level.options.includes(id)) return s;
    return {
      ...s,
      choice: id,
      attempts: s.attempts + 1,
      status: id === s.level.answerId ? "won" : "playing",
    };
  }
  function getHint(s) {
    return s.level.unit;
  }
  function validate(l) {
    return (
      l.sequence.every((v, i) => v === l.unit[i % l.unit.length]) &&
      l.answerId === l.unit[l.blankIndex % l.unit.length] &&
      new Set(l.options).size === 3 &&
      l.options.filter((v) => v === l.answerId).length === 1
    );
  }
  return { createGame, answer, getHint, validate };
});
