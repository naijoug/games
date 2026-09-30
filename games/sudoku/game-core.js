(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SudokuCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const groups = [];
  for (let r = 0; r < 4; r++) groups.push([0, 1, 2, 3].map((c) => r * 4 + c));
  for (let c = 0; c < 4; c++) groups.push([0, 1, 2, 3].map((r) => r * 4 + c));
  for (let r = 0; r < 4; r += 2)
    for (let c = 0; c < 4; c += 2)
      groups.push([
        r * 4 + c,
        r * 4 + c + 1,
        (r + 1) * 4 + c,
        (r + 1) * 4 + c + 1,
      ]);
  function candidates(cells, i) {
    const used = new Set(
      groups
        .filter((g) => g.includes(i))
        .flatMap((g) => g.filter((j) => j !== i).map((j) => cells[j])),
    );
    return [1, 2, 3, 4].filter((n) => !used.has(n));
  }
  function conflicts(cells) {
    return [
      ...new Set(
        groups.flatMap((g) =>
          g.filter(
            (i) => cells[i] && g.some((j) => j !== i && cells[j] === cells[i]),
          ),
        ),
      ),
    ];
  }
  function countSolutions(cells, limit = 2) {
    if (conflicts(cells).length) return 0;
    const empty = cells.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
    if (!empty.length) return 1;
    const i = empty.sort(
      (a, b) => candidates(cells, a).length - candidates(cells, b).length,
    )[0];
    let total = 0;
    for (const v of candidates(cells, i)) {
      const next = cells.slice();
      next[i] = v;
      total += countSolutions(next, limit - total);
      if (total >= limit) return limit;
    }
    return total;
  }
  function createGame(level) {
    return {
      level,
      cells: level.givens.slice(),
      history: [],
      status: "playing",
    };
  }
  function setCell(s, i, v) {
    if (
      !Number.isInteger(i) ||
      i < 0 ||
      i >= 16 ||
      !Number.isInteger(v) ||
      v < 0 ||
      v > 4 ||
      s.level.givens[i] ||
      s.cells[i] === v
    )
      return s;
    const cells = s.cells.slice();
    cells[i] = v;
    return {
      ...s,
      cells,
      history: [...s.history, s.cells],
      status:
        cells.every(Boolean) && !conflicts(cells).length ? "won" : "playing",
    };
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
    const bad = s.cells.findIndex((v, i) => v && v !== s.level.solution[i]);
    if (bad >= 0)
      return { index: bad, text: "请先检查这个格子，可以清除后再试。" };
    for (let i = 0; i < 16; i++)
      if (!s.cells[i]) {
        const c = candidates(s.cells, i);
        if (c.length === 1)
          return {
            index: i,
            value: c[0],
            text: "观察它所在的行、列和小宫，这里只剩一种可以放的图案。",
          };
      }
    for (const g of groups)
      for (let v = 1; v <= 4; v++) {
        if (g.some((i) => s.cells[i] === v)) continue;
        const places = g.filter(
          (i) => !s.cells[i] && candidates(s.cells, i).includes(v),
        );
        if (places.length === 1)
          return {
            index: places[0],
            value: v,
            text: "在这一行、列或小宫中，这个图案只有一个位置可以放。",
          };
      }
    return null;
  }
  return {
    createGame,
    setCell,
    clearCell: (s, i) => setCell(s, i, 0),
    undo,
    getHint,
    candidates,
    conflicts,
    countSolutions,
  };
});
