const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../game-core.js");
const L = require("../levels.js");
const S = require("../solver.js");
test("18 levels replay legal solutions and fit search budget", () => {
  assert.equal(L.length, 18);
  for (const l of L) {
    let s = C.createGame(l);
    for (const m of l.solution) {
      let n = C.moveVehicle(s, m.id, m.delta);
      assert.notEqual(n, s);
      s = n;
    }
    assert.equal(s.status, "won");
    assert.equal(C.undo(s).status, "playing");
    const search = S.search(C.createGame(l));
    let r;
    do {
      r = search.step();
    } while (r.status === "searching");
    assert.equal(r.status, "solved");
  }
});
test("cannot cross cars or boundary, invalid move leaves history alone", () => {
  const s = C.createGame({
    vehicles: [
      { id: "A", x: 0, y: 2, length: 2, axis: "h" },
      { id: "B", x: 3, y: 1, length: 3, axis: "v" },
    ],
    targetId: "A",
    exitRow: 2,
  });
  assert.equal(C.moveVehicle(s, "A", 4), s);
  assert.equal(C.moveVehicle(s, "A", -1), s);
  assert.equal(C.moveVehicle(s, "X", 1), s);
  assert.equal(C.moveVehicle(s, "A", 0.5), s);
  assert.deepEqual(C.undo(C.moveVehicle(s, "A", 1)), s);
  assert.equal(S.search(s, 1).step().status, "limit");
});
