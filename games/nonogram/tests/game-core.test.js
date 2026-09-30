const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../game-core.js");
const L = require("../levels.js");
test("20 puzzles have unique solutions reachable without guessing", () => {
  assert.equal(L.length, 20);
  for (const l of L) {
    assert.equal(C.countSolutions(l), 1);
    assert.deepEqual(C.propagate(l, Array(25).fill(-1)), l.solution);
    let s = C.createGame(l);
    l.solution.forEach((v, i) => {
      if (v) s = C.setCell(s, i, 1);
    });
    assert.equal(s.status, "won");
    const i = l.solution.indexOf(0);
    if (i >= 0) assert.equal(C.setCell(s, i, 1).status, "playing");
  }
});
test("line clues and contradictions", () => {
  assert.deepEqual(C.getLineCandidates([0]), [[0, 0, 0, 0, 0]]);
  assert.deepEqual(C.getLineCandidates([5]), [[1, 1, 1, 1, 1]]);
  assert(
    C.getLineCandidates([2, 1]).every(
      (a) => JSON.stringify(C.clues(a)) === "[2,1]",
    ),
  );
  const l = {
    rowClues: [[5], [0], [0], [0], [0]],
    colClues: [[0], [0], [0], [0], [0]],
  };
  assert.equal(C.countSolutions(l), 0);
  const multi = { rowClues: Array(5).fill([1]), colClues: Array(5).fill([1]) };
  assert.equal(C.countSolutions(multi), 2);
});
test("three state undo and error hints", () => {
  const s = C.createGame(L[0]);
  const n = C.setCell(s, 0, 0);
  assert(C.getHint(n).error);
  assert.deepEqual(C.undo(n), s);
  assert.equal(C.setCell(s, -1, 1), s);
});

test("hints report later line contradictions before offering an earlier deduction", () => {
  const s = C.createGame(L[0]);
  const wrong = C.setCell(s, 5, 1);
  const hint = C.getHint(wrong);
  assert.equal(hint.error, true);
  assert(hint.indices.includes(5));
});
