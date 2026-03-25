const test = require("node:test");
const assert = require("node:assert/strict");

const {
  STORAGE_KEY,
  createEmptyProgress,
  loadProgress,
  saveProgress,
  beginPuzzleRun,
  recordPuzzleMistake,
  recordPuzzleHint,
  finalizePuzzleRun,
  applyPuzzleResult,
  getPuzzleRecord,
  applyLessonProgress,
  getLessonRecord,
} = require("../progress-core.js");

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    dump() {
      return map;
    },
  };
}

test("createEmptyProgress initializes versioned profile shape", () => {
  const progress = createEmptyProgress();
  assert.equal(progress.version, 1);
  assert.deepEqual(progress.puzzles, {});
  assert.deepEqual(progress.lessons, {});
  assert.equal(progress.profile.totalPuzzleScore, 0);
});

test("puzzle scoring rewards clean fast solves and grades by score ratio", () => {
  const puzzle = { id: "p1", baseScore: 300, parSeconds: 20, difficulty: "medium" };
  let run = beginPuzzleRun(puzzle, 1000);
  run = finalizePuzzleRun(puzzle, run, 11000);

  assert.equal(run.solved, true);
  assert.ok(run.score >= 300);
  assert.ok(run.stars >= 2);
  assert.ok(["S", "A", "B", "C"].includes(run.grade));
});

test("puzzle scoring penalizes mistakes and hints", () => {
  const puzzle = { id: "p2", baseScore: 400, parSeconds: 30, difficulty: "hard" };
  let run = beginPuzzleRun(puzzle, 0);
  run = recordPuzzleMistake(run);
  run = recordPuzzleMistake(run);
  run = recordPuzzleHint(run);
  run = finalizePuzzleRun(puzzle, run, 65000);

  assert.equal(run.mistakes, 2);
  assert.equal(run.hintsUsed, 1);
  assert.ok(run.score < 400);
  assert.ok(run.stars >= 1 && run.stars <= 3);
});

test("applyPuzzleResult persists best score and aggregates attempts/fails", () => {
  const puzzle = { id: "p3", baseScore: 250, parSeconds: 20, difficulty: "easy" };
  let progress = createEmptyProgress();

  let failedRun = beginPuzzleRun(puzzle, 0);
  failedRun = recordPuzzleMistake(failedRun);
  failedRun = finalizePuzzleRun(puzzle, failedRun, 5000, { solved: false });
  progress = applyPuzzleResult(progress, puzzle, failedRun);

  let solvedRun = beginPuzzleRun(puzzle, 10000);
  solvedRun = finalizePuzzleRun(puzzle, solvedRun, 18000);
  progress = applyPuzzleResult(progress, puzzle, solvedRun);

  const record = getPuzzleRecord(progress, puzzle.id);
  assert.equal(record.attempts, 2);
  assert.equal(record.fails, 1);
  assert.equal(record.clears, 1);
  assert.equal(record.bestScore, solvedRun.score);
  assert.equal(progress.profile.totalPuzzleClears, 1);
});

test("lesson progress persists max step and completion status", () => {
  let progress = createEmptyProgress();
  progress = applyLessonProgress(progress, "lesson-a", 4, 12, 1000);
  progress = applyLessonProgress(progress, "lesson-a", 9, 12, 2000);
  progress = applyLessonProgress(progress, "lesson-a", 3, 12, 3000);
  progress = applyLessonProgress(progress, "lesson-a", 12, 12, 4000);

  const record = getLessonRecord(progress, "lesson-a");
  assert.equal(record.maxStepReached, 12);
  assert.equal(record.completed, true);
  assert.equal(record.views >= 1, true);
});

test("load/save roundtrip uses STORAGE_KEY and tolerates invalid JSON", () => {
  const storage = createMemoryStorage();
  storage.setItem(STORAGE_KEY, "{invalid");

  let progress = loadProgress(storage);
  assert.equal(progress.version, 1);

  progress = applyLessonProgress(progress, "lesson-z", 2, 8, 123);
  saveProgress(storage, progress);

  const restored = loadProgress(storage);
  assert.deepEqual(getLessonRecord(restored, "lesson-z"), getLessonRecord(progress, "lesson-z"));
});
