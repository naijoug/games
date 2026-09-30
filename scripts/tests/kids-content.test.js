const { test } = require("node:test");
const assert = require("node:assert/strict");
const specs = {
  maze: [18, (l) => l.map],
  patterns: [24, (l) => [l.unit, l.sequence, l.blankIndex, l.dual]],
  sudoku: [24, (l) => l.givens],
  tangram: [12, (l) => l.solution],
  traffic: [18, (l) => l.vehicles],
  symmetry: [18, (l) => [l.axis, l.target]],
  pipes: [18, (l) => [l.size, l.cells]],
  robot: [18, (l) => [l.map, l.start, l.direction, l.goal]],
  nonogram: [20, (l) => l.solution],
};
for (const [slug, [count, identity]] of Object.entries(specs)) {
  test(`${slug} ships the promised number of distinct challenges and stable IDs`, () => {
    const levels = require(`../../games/${slug}/levels.js`);
    assert.equal(levels.length, count);
    assert.equal(new Set(levels.map((l) => l.id)).size, count);
    assert.equal(
      new Set(levels.map((l) => JSON.stringify(identity(l)))).size,
      count,
    );
  });
}
