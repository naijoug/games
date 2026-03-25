(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ChessModeCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  function createModeState() {
    return {
      mode: "pvp",
      puzzle: {
        tier: "mate1",
        currentIndex: 0,
        activePuzzleId: null,
        playerMoves: [],
        opponentMoves: [],
        status: "idle",
      },
    };
  }

  function clonePuzzle(puzzle) {
    return {
      tier: puzzle.tier,
      currentIndex: puzzle.currentIndex,
      activePuzzleId: puzzle.activePuzzleId,
      playerMoves: puzzle.playerMoves.slice(),
      opponentMoves: puzzle.opponentMoves.slice(),
      status: puzzle.status,
    };
  }

  function setGameMode(state, mode) {
    return {
      mode,
      puzzle: clonePuzzle(state.puzzle),
    };
  }

  function setPuzzleTier(state, tier) {
    const puzzle = clonePuzzle(state.puzzle);
    puzzle.tier = tier;
    puzzle.currentIndex = 0;
    puzzle.activePuzzleId = null;
    puzzle.playerMoves = [];
    puzzle.opponentMoves = [];
    puzzle.status = "idle";

    return {
      mode: state.mode,
      puzzle,
    };
  }

  function getTierList(catalog, tier) {
    if (!catalog || !Array.isArray(catalog[tier])) {
      return [];
    }
    return catalog[tier];
  }

  function startPuzzle(state, catalog, index) {
    const tier = state.puzzle.tier;
    const list = getTierList(catalog, tier);
    const safeIndex = Math.max(0, Math.min(Number.isInteger(index) ? index : 0, Math.max(0, list.length - 1)));
    const puzzleItem = list[safeIndex] || null;
    const puzzle = clonePuzzle(state.puzzle);
    puzzle.currentIndex = safeIndex;
    puzzle.activePuzzleId = puzzleItem ? puzzleItem.id : null;
    puzzle.playerMoves = [];
    puzzle.opponentMoves = [];
    puzzle.status = puzzleItem ? "active" : "empty";

    return {
      mode: state.mode,
      puzzle,
    };
  }

  function recordPuzzlePlayerMove(state, san) {
    const puzzle = clonePuzzle(state.puzzle);
    puzzle.playerMoves.push(san);
    return {
      mode: state.mode,
      puzzle,
    };
  }

  function recordPuzzleOpponentMove(state, san) {
    const puzzle = clonePuzzle(state.puzzle);
    puzzle.opponentMoves.push(san);
    return {
      mode: state.mode,
      puzzle,
    };
  }

  function createLessonState(lessons) {
    const first = Array.isArray(lessons) && lessons.length > 0 ? lessons[0] : null;
    return {
      activeLessonId: first ? first.id : null,
      stepIndex: 0,
    };
  }

  function findLesson(lessons, lessonId) {
    if (!Array.isArray(lessons)) {
      return null;
    }
    return lessons.find((lesson) => lesson.id === lessonId) || null;
  }

  function selectLesson(state, lessons, lessonId) {
    const lesson = findLesson(lessons, lessonId);
    if (!lesson) {
      return { activeLessonId: state.activeLessonId, stepIndex: state.stepIndex };
    }
    return {
      activeLessonId: lesson.id,
      stepIndex: 0,
    };
  }

  function nextLessonStep(state, lessons) {
    const lesson = findLesson(lessons, state.activeLessonId);
    if (!lesson) {
      return { activeLessonId: state.activeLessonId, stepIndex: state.stepIndex };
    }

    const maxIndex = lesson.moves.length;
    return {
      activeLessonId: state.activeLessonId,
      stepIndex: Math.min(state.stepIndex + 1, maxIndex),
    };
  }

  function prevLessonStep(state) {
    return {
      activeLessonId: state.activeLessonId,
      stepIndex: Math.max(0, state.stepIndex - 1),
    };
  }

  return {
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
  };
});
