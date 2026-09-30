const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../game-core.js");
const L = require("../levels.js");
test("18 targets mirror exactly and allow painting to completion", () => {
  assert.equal(L.length, 18);
  for (const l of L) {
    let s = C.createGame(l);
    for (let i = 0; i < s.cells.length; i++) {
      assert.equal(C.mirror(l, C.mirror(l, i)), i);
      assert.equal(l.target[i], l.target[C.mirror(l, i)]);
      s = C.paintCell(s, i, l.target[i]);
    }
    assert.equal(C.checkAnswer(s).status, "won");
    assert.equal(C.undo(s).status, "playing");
  }
});
test("read-only side, blank errors and undo", () => {
  let s = C.createGame(L[0]);
  assert.equal(C.paintCell(s, 0, 2), s);
  const i = s.cells.findIndex((v, i) => !s.level.readonly.includes(i));
  let n = C.paintCell(s, i, 3);
  assert.equal(C.checkAnswer(n).status, "playing");
  assert.deepEqual(C.undo(n), s);
  assert.equal(C.getHint(s).source, C.mirror(s.level, C.getHint(s).index));
});
