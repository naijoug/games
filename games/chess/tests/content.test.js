const test = require('node:test');
const assert = require('node:assert/strict');
const { PUZZLE_TIERS, LESSONS } = require('../content.js');

function assertPuzzleShape(puzzle) {
  assert.equal(typeof puzzle.id, 'string');
  assert.equal(typeof puzzle.title, 'string');
  assert.equal(typeof puzzle.goalLabel, 'string');
  assert.ok(Array.isArray(puzzle.setupMoves));
  assert.ok(puzzle.setupMoves.length > 0);
  assert.ok(Array.isArray(puzzle.solutionLine));
  assert.ok(puzzle.solutionLine.length > 0);
  assert.ok(["easy", "medium", "hard"].includes(puzzle.difficulty));
  assert.ok(Array.isArray(puzzle.tags));
  assert.ok(puzzle.tags.length >= 1);
  assert.ok(Array.isArray(puzzle.hints));
  assert.ok(puzzle.hints.length >= 1);
  assert.equal(typeof puzzle.baseScore, "number");
  assert.ok(puzzle.baseScore > 0);
  assert.equal(typeof puzzle.parSeconds, "number");
  assert.ok(puzzle.parSeconds > 0);
  for (const step of puzzle.solutionLine) {
    assert.ok(step.actor === 'player' || step.actor === 'opponent');
    assert.equal(typeof step.san, 'string');
    assert.ok(step.san.length > 0);
  }
}

test('puzzle tiers expose mate1 mate2 mate3 with at least one puzzle each', () => {
  assert.ok(PUZZLE_TIERS);
  const ids = new Set();
  for (const key of ['mate1', 'mate2', 'mate3']) {
    assert.ok(Array.isArray(PUZZLE_TIERS[key]), `${key} should be an array`);
    assert.ok(PUZZLE_TIERS[key].length >= 1, `${key} should contain puzzles`);
    for (const puzzle of PUZZLE_TIERS[key]) {
      assertPuzzleShape(puzzle);
      assert.equal(ids.has(puzzle.id), false, `duplicate puzzle id: ${puzzle.id}`);
      ids.add(puzzle.id);
    }
  }
});

test('classic lessons contain move list and notes', () => {
  assert.ok(Array.isArray(LESSONS));
  assert.ok(LESSONS.length >= 3);
  const ids = new Set();
  const sections = new Set();
  for (const lesson of LESSONS) {
    assert.equal(typeof lesson.id, 'string');
    assert.equal(typeof lesson.title, 'string');
    assert.equal(typeof lesson.summary, 'string');
    assert.equal(typeof lesson.section, 'string');
    assert.equal(typeof lesson.players, 'string');
    assert.equal(typeof lesson.era, 'string');
    assert.ok(Array.isArray(lesson.tags));
    assert.ok(lesson.tags.length >= 1);
    sections.add(lesson.section);
    assert.equal(ids.has(lesson.id), false, `duplicate lesson id: ${lesson.id}`);
    ids.add(lesson.id);
    assert.ok(Array.isArray(lesson.moves));
    assert.ok(lesson.moves.length >= 6);
    let notes = 0;
    for (const step of lesson.moves) {
      assert.equal(typeof step.san, 'string');
      if (step.note) {
        notes += 1;
        assert.equal(typeof step.note, 'string');
      }
    }
    assert.ok(notes >= 2, 'lesson should include annotations');
  }
  assert.ok(sections.size >= 3, 'lessons should span multiple sections');
});

test('each puzzle tier has multiple entries for progression', () => {
  assert.ok(PUZZLE_TIERS.mate1.length >= 2);
  assert.ok(PUZZLE_TIERS.mate2.length >= 2);
  assert.ok(PUZZLE_TIERS.mate3.length >= 2);
});

test('lesson catalog includes classic masters and chapter categories', () => {
  const ids = new Set(LESSONS.map((lesson) => lesson.id));
  assert.ok(ids.has('capablanca-fragment'));
  assert.ok(ids.has('fischer-fragment'));
  assert.ok(ids.has('kasparov-fragment'));

  const sections = new Set(LESSONS.map((lesson) => lesson.section));
  for (const required of ['opening-attack', 'positional-play', 'initiative-attack']) {
    assert.ok(sections.has(required), `missing lesson section ${required}`);
  }
});
