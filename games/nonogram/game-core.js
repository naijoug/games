(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.NonogramCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function clues(line) {
    const out = [];
    let run = 0;
    for (const v of [...line, 0]) {
      if (v === 1) run++;
      else if (run) {
        out.push(run);
        run = 0;
      }
    }
    return out.length ? out : [0];
  }
  function getLineCandidates(clue, line = Array(5).fill(-1)) {
    const out = [];
    for (let mask = 0; mask < 32; mask++) {
      const a = Array.from({ length: 5 }, (_, i) => (mask >> i) & 1);
      if (
        JSON.stringify(clues(a)) === JSON.stringify(clue) &&
        a.every((v, i) => line[i] === -1 || v === line[i])
      )
        out.push(a);
    }
    return out;
  }
  function lines(level) {
    return [
      ...level.rowClues.map((c, r) => ({
        clue: c,
        ids: Array.from({ length: 5 }, (_, i) => r * 5 + i),
        label: "第 " + (r + 1) + " 行",
      })),
      ...level.colClues.map((c, col) => ({
        clue: c,
        ids: Array.from({ length: 5 }, (_, r) => r * 5 + col),
        label: "第 " + (col + 1) + " 列",
      })),
    ];
  }
  function deduction(level, cells) {
    const possibilities = lines(level).map((l) => ({
      ...l,
      possible: getLineCandidates(
        l.clue,
        l.ids.map((i) => cells[i]),
      ),
    }));
    const conflict = possibilities.find((l) => !l.possible.length);
    if (conflict)
      return {
        error: true,
        text: conflict.label + " 的标记与线索冲突，请检查。",
        indices: conflict.ids,
      };
    for (const l of possibilities) {
      const possible = l.possible;
      for (let k = 0; k < 5; k++)
        if (
          cells[l.ids[k]] === -1 &&
          possible.every((p) => p[k] === possible[0][k])
        )
          return {
            index: l.ids[k],
            value: possible[0][k],
            text:
              l.label +
              " 所有符合线索的排法，在这个位置都" +
              (possible[0][k] ? "需要填色。" : "必须留空。"),
          };
    }
    return null;
  }
  function propagate(level, input) {
    const cells = input.slice();
    for (let n = 0; n < 26; n++) {
      const h = deduction(level, cells);
      if (h?.error) return null;
      if (!h) return cells;
      cells[h.index] = h.value;
    }
    return cells;
  }
  function countSolutions(level, input = Array(25).fill(-1), limit = 2) {
    const a = propagate(level, input);
    if (!a) return 0;
    const i = a.indexOf(-1);
    if (i < 0) return 1;
    let count = 0;
    for (const v of [0, 1]) {
      const b = a.slice();
      b[i] = v;
      count += countSolutions(level, b, limit - count);
      if (count >= limit) return limit;
    }
    return count;
  }
  function createGame(level) {
    return { level, cells: Array(25).fill(-1), history: [], status: "playing" };
  }
  function checkSolved(s) {
    return lines(s.level).every(
      (l) =>
        JSON.stringify(clues(l.ids.map((i) => (s.cells[i] === 1 ? 1 : 0)))) ===
        JSON.stringify(l.clue),
    );
  }
  function setCell(s, i, v) {
    if (
      !Number.isInteger(i) ||
      i < 0 ||
      i >= 25 ||
      ![-1, 0, 1].includes(v) ||
      s.cells[i] === v
    )
      return s;
    const cells = s.cells.slice();
    cells[i] = v;
    const n = { ...s, cells, history: [...s.history, s.cells] };
    n.status = checkSolved(n) ? "won" : "playing";
    return n;
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
  function getHint(s) {
    return deduction(s.level, s.cells);
  }
  return {
    clues,
    getLineCandidates,
    deduction,
    propagate,
    countSolutions,
    createGame,
    setCell,
    checkSolved,
    undo,
    getHint,
  };
});
