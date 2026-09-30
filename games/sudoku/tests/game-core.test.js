const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../game-core.js");
const L = require("../levels.js");
test("all 24 puzzles have one solution and can be solved by single deductions", () => {
  assert.equal(L.length, 24);
  for (const l of L) {
    assert.equal(C.countSolutions(l.givens), 1);
    let s = C.createGame(l),
      guard = 16;
    while (s.status !== "won" && guard--) {
      const h = C.getHint(s);
      assert(h?.value);
      s = C.setCell(s, h.index, h.value);
    }
    assert.equal(s.status, "won");
    assert.deepEqual(s.cells, l.solution);
    assert.equal(C.undo(s).status, "playing");
  }
});
test("givens protected, conflicts never win, invalid and same values ignored", () => {
  let s = C.createGame(L[0]);
  const fixed = s.cells.findIndex(Boolean),
    empty = s.cells.indexOf(0);
  assert.equal(C.setCell(s, fixed, 4), s);
  assert.equal(C.setCell(s, 17, 2), s);
  s = C.setCell(
    s,
    empty,
    s.cells.find((v, i) => Math.floor(i / 4) === Math.floor(empty / 4) && v),
  );
  assert(C.conflicts(s.cells).length);
  assert.equal(s.status, "playing");
  assert.equal(C.getHint(s).index, empty);
  assert.deepEqual(C.undo(s).cells, L[0].givens);
});
test("solver detects impossible and ambiguous boards", () => {
  assert.equal(C.countSolutions(Array(16).fill(0)), 2);
  assert.equal(C.countSolutions([1, 1, ...Array(14).fill(0)]), 0);
});
