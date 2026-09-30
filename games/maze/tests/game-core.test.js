const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../game-core.js");
const L = require("../levels.js");
test("all 18 levels solve with legal recorded routes and live hints", () => {
  assert.equal(L.length, 18);
  for (const l of L) {
    let s = C.createGame(l);
    for (const d of l.solution) {
      const before = s;
      s = C.move(s, d);
      assert.notEqual(s, before);
    }
    assert.equal(s.status, "won");
    s = C.undo(s);
    assert.equal(s.status, "playing");
    s = C.move(s, C.getHint(s));
    assert.equal(s.status, "won");
    let h = C.createGame(l),
      guard = 100;
    while (h.status !== "won" && guard--) h = C.move(h, C.getHint(h));
    assert.equal(h.status, "won");
  }
});
test("invalid actions and restart do not corrupt history", () => {
  let s = C.createGame(L[0]);
  assert.equal(C.move(s, "up"), s);
  assert.equal(C.move(s, "oops"), s);
  assert.equal(C.undo(s), s);
  const next = C.move(s, L[0].solution[0]);
  assert.deepEqual(C.undo(next), s);
  assert.equal(s.moves, 0);
  assert.throws(() => C.createGame({ map: ["SG", "S "] }));
});
