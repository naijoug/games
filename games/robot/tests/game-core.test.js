const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../game-core.js");
const L = require("../levels.js");
test("all 18 reference programs finish at the delivery point", () => {
  assert.equal(L.length, 18);
  for (const l of L) {
    let s = C.createRun(l, l.solution),
      guard = 64;
    while (s.status === "running" && guard--) s = C.stepRun(s);
    assert.equal(s.status, "won", l.id);
    assert.equal(s.player, l.goal);
    assert(s.pc <= 64);
  }
});
test("validation rejects empty, nested, excessive and invalid repeat programs", () => {
  for (const p of [
    [],
    [{ type: "repeat", count: 2, body: [] }],
    [
      {
        type: "repeat",
        count: 2,
        body: [{ type: "repeat", count: 2, body: [] }],
      },
    ],
    Array(21).fill({ type: "forward" }),
    [{ type: "repeat", count: 5, body: [{ type: "forward" }] }],
  ])
    assert(C.validateProgram(p));
  assert(
    C.validateProgram([
      { type: "repeat", count: 4, body: Array(17).fill({ type: "forward" }) },
    ]),
  );
});
test("wall stops in place, turns work in four directions and loops map to source", () => {
  for (let d = 0; d < 4; d++) {
    let s = C.createRun({ ...L[0], direction: d }, [{ type: "right" }]);
    s = C.stepRun(s);
    assert.equal(s.direction, (d + 1) % 4);
  }
  let s = C.createRun({ ...L[0], direction: 0 }, [{ type: "forward" }]);
  s = C.stepRun(s);
  assert.equal(s.player, 0);
  assert.equal(s.status, "needs-edit");
  const a = C.compileProgram([
    {
      type: "repeat",
      count: 3,
      body: [{ type: "forward" }, { type: "right" }],
    },
  ]);
  assert.equal(a.length, 6);
  assert.deepEqual(a[4], { action: "forward", index: 0, childIndex: 0 });
});
test("passing through target is not completion if program ends elsewhere", () => {
  const l = {
    size: 3,
    map: ["...", "...", "..."],
    start: 0,
    goal: 1,
    direction: 1,
  };
  let s = C.createRun(l, [{ type: "forward" }, { type: "forward" }]);
  s = C.stepRun(C.stepRun(s));
  assert.equal(s.status, "needs-edit");
});
