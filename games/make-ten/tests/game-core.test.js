const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../game-core.js");
test("all available legal choices preserve solvability", () => {
  for (const target of [5, 10])
    for (let seed = 1; seed <= 12; seed++) {
      let rng = seed;
      const randomFn = () => {
        rng = (1664525 * rng + 1013904223) >>> 0;
        return rng / 2 ** 32;
      };
      const initial = C.createGame({ target, randomFn });
      const seen = new Set();
      function visit(s) {
        const key = s.matchedIds.slice().sort().join(",");
        if (seen.has(key)) return;
        seen.add(key);
        const available = s.cards.filter((c) => !s.matchedIds.includes(c.id));
        if (!available.length) {
          assert.equal(s.status, "won");
          return;
        }
        let count = 0;
        for (let i = 0; i < available.length; i++)
          for (let j = i + 1; j < available.length; j++)
            if (available[i].value + available[j].value === target) {
              count++;
              visit(
                C.selectCard(C.selectCard(s, available[i].id), available[j].id),
              );
            }
        assert(count > 0);
      }
      visit(initial);
    }
});
test("same card cannot pair with itself and wrong selection locks until resolved", () => {
  let s = C.createGame({ target: 10, randomFn: () => 0 });
  s = C.selectCard(s, 0);
  assert.equal(C.selectCard(s, 0), s);
  s = C.selectCard(s, 2);
  assert(s.locked);
  assert.equal(C.selectCard(s, 1), s);
  s = C.resolveAttempt(s);
  assert.equal(s.selectedIds.length, 0);
  assert.equal(s.matchedIds.length, 0);
  assert.throws(() => C.createGame({ target: 7 }));
});
