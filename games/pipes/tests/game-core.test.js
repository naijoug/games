const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../game-core.js");
const L = require("../levels.js");
test("18 pipe solutions connect source to garden without leaks", () => {
  assert.equal(L.length, 18);
  for (const l of L) {
    let s = C.createGame(l);
    for (let i = 0; i < s.cells.length; i++)
      for (let k = 0; k < (4 - l.cells[i].rotation) % 4; k++)
        s = C.rotateCell(s, i);
    assert(C.traceWater(s).won);
    assert.equal(C.checkAnswer(s).status, "won");
    assert(C.traceWater(s).path.length <= l.size * l.size);
  }
});
test("rotation cycle, locked endpoints and leak diagnosis", () => {
  let s = C.createGame(L[0]);
  assert.equal(C.rotateCell(s, s.level.source), s);
  const i = s.cells.findIndex((c) => !c.locked && c.mask);
  const orig = s;
  for (let n = 0; n < 4; n++) s = C.rotateCell(s, i);
  assert.deepEqual(s.cells, orig.cells);
  const t = C.traceWater(orig);
  if (!t.won) {
    assert(t.leaks.length);
    assert(C.getHint(orig));
  }
  assert.deepEqual(C.undo(C.rotateCell(orig, i)), orig);
});
test("initial puzzles need work; closed cycles terminate and mismatched ports leak", () => {
  for (const l of L)
    assert.equal(C.traceWater(C.createGame(l)).won, false, l.id);
  const s = C.createGame({
    size: 2,
    source: 0,
    goal: 3,
    cells: [
      { mask: 6, rotation: 0 },
      { mask: 12, rotation: 0 },
      { mask: 3, rotation: 0 },
      { mask: 9, rotation: 0 },
    ],
  });
  assert.equal(C.traceWater(s).path.length, 4);
  const broken = {
    ...s,
    cells: s.cells.map((c, i) => (i === 1 ? { ...c, mask: 0 } : c)),
  };
  assert(C.traceWater(broken).leaks.length > 0);
});
