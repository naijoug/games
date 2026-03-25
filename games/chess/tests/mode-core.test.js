const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createModeState,
  setGameMode,
  setPuzzleTier,
  startPuzzle,
  recordPuzzlePlayerMove,
  recordPuzzleOpponentMove,
  createLessonState,
  selectLesson,
  nextLessonStep,
  prevLessonStep,
} = require('../mode-core.js');

const mockCatalog = {
  mate1: [{ id: 'm1-a' }],
  mate2: [{ id: 'm2-a' }, { id: 'm2-b' }],
  mate3: [{ id: 'm3-a' }],
};

const mockLessons = [
  { id: 'legal', moves: [{ san: 'e4' }, { san: 'e5' }, { san: 'Nf3' }] },
  { id: 'opera', moves: [{ san: 'e4' }, { san: 'e5' }] },
];

test('mode state defaults to pvp and can switch modes', () => {
  let state = createModeState();
  assert.equal(state.mode, 'pvp');
  state = setGameMode(state, 'ai');
  assert.equal(state.mode, 'ai');
});

test('puzzle state selects tier and starts by index', () => {
  let state = createModeState();
  state = setPuzzleTier(state, 'mate2');
  assert.equal(state.puzzle.tier, 'mate2');
  state = startPuzzle(state, mockCatalog, 1);
  assert.equal(state.puzzle.activePuzzleId, 'm2-b');
  assert.equal(state.puzzle.currentIndex, 1);
  assert.deepEqual(state.puzzle.playerMoves, []);
});

test('puzzle move recording appends player/opponent moves', () => {
  let state = startPuzzle(createModeState(), mockCatalog, 0);
  state = recordPuzzlePlayerMove(state, 'Qh5+');
  state = recordPuzzleOpponentMove(state, 'g6');
  assert.deepEqual(state.puzzle.playerMoves, ['Qh5+']);
  assert.deepEqual(state.puzzle.opponentMoves, ['g6']);
});

test('lesson state selects lessons and clamps navigation', () => {
  let lessonState = createLessonState(mockLessons);
  assert.equal(lessonState.activeLessonId, 'legal');
  assert.equal(lessonState.stepIndex, 0);

  lessonState = selectLesson(lessonState, mockLessons, 'opera');
  assert.equal(lessonState.activeLessonId, 'opera');
  assert.equal(lessonState.stepIndex, 0);

  lessonState = nextLessonStep(lessonState, mockLessons);
  lessonState = nextLessonStep(lessonState, mockLessons);
  lessonState = nextLessonStep(lessonState, mockLessons);
  assert.equal(lessonState.stepIndex, 2);

  lessonState = prevLessonStep(lessonState);
  lessonState = prevLessonStep(lessonState);
  lessonState = prevLessonStep(lessonState);
  assert.equal(lessonState.stepIndex, 0);
});
