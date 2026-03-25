(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ChessProgressCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const STORAGE_KEY = "chessArena.progress.v1";
  const VERSION = 1;

  function nowMs() {
    return Date.now();
  }

  function createEmptyProgress() {
    return {
      version: VERSION,
      puzzles: {},
      lessons: {},
      profile: {
        totalPuzzleScore: 0,
        totalPuzzleClears: 0,
        totalPuzzleAttempts: 0,
        totalLessonViews: 0,
        lastPlayedMode: "pvp",
        updatedAt: 0,
      },
    };
  }

  function cloneProgress(progress) {
    return {
      version: VERSION,
      puzzles: { ...(progress.puzzles || {}) },
      lessons: { ...(progress.lessons || {}) },
      profile: {
        ...createEmptyProgress().profile,
        ...(progress.profile || {}),
      },
    };
  }

  function sanitizeProgress(input) {
    if (!input || typeof input !== "object") {
      return createEmptyProgress();
    }
    const base = createEmptyProgress();
    const safe = cloneProgress({
      version: input.version,
      puzzles: input.puzzles && typeof input.puzzles === "object" ? input.puzzles : {},
      lessons: input.lessons && typeof input.lessons === "object" ? input.lessons : {},
      profile: input.profile && typeof input.profile === "object" ? input.profile : base.profile,
    });
    safe.version = VERSION;
    return safe;
  }

  function loadProgress(storageLike) {
    if (!storageLike || typeof storageLike.getItem !== "function") {
      return createEmptyProgress();
    }
    try {
      const raw = storageLike.getItem(STORAGE_KEY);
      if (!raw) {
        return createEmptyProgress();
      }
      return sanitizeProgress(JSON.parse(raw));
    } catch (_) {
      return createEmptyProgress();
    }
  }

  function saveProgress(storageLike, progress) {
    if (!storageLike || typeof storageLike.setItem !== "function") {
      return false;
    }
    try {
      storageLike.setItem(STORAGE_KEY, JSON.stringify(sanitizeProgress(progress)));
      return true;
    } catch (_) {
      return false;
    }
  }

  function puzzleBaseScore(puzzle) {
    if (puzzle && Number.isFinite(puzzle.baseScore) && puzzle.baseScore > 0) {
      return puzzle.baseScore;
    }
    const difficulty = puzzle && puzzle.difficulty;
    if (difficulty === "hard") {
      return 500;
    }
    if (difficulty === "medium") {
      return 350;
    }
    return 220;
  }

  function puzzleParSeconds(puzzle) {
    if (puzzle && Number.isFinite(puzzle.parSeconds) && puzzle.parSeconds > 0) {
      return puzzle.parSeconds;
    }
    return 30;
  }

  function beginPuzzleRun(puzzle, startedAt) {
    return {
      puzzleId: puzzle && puzzle.id ? puzzle.id : null,
      startedAt: Number.isFinite(startedAt) ? startedAt : nowMs(),
      finishedAt: null,
      elapsedMs: 0,
      mistakes: 0,
      hintsUsed: 0,
      solved: false,
      score: 0,
      stars: 0,
      grade: "F",
      ratio: 0,
      bonusBreakdown: null,
    };
  }

  function recordPuzzleMistake(run) {
    return {
      ...run,
      mistakes: (run.mistakes || 0) + 1,
    };
  }

  function recordPuzzleHint(run) {
    return {
      ...run,
      hintsUsed: (run.hintsUsed || 0) + 1,
    };
  }

  function deriveStarsAndGrade(score, referenceBase, solved) {
    if (!solved) {
      return { stars: 0, grade: "F", ratio: 0 };
    }
    const base = Math.max(1, referenceBase || 1);
    const ratio = score / base;
    let stars = 1;
    if (ratio >= 1.15) {
      stars = 3;
    } else if (ratio >= 0.85) {
      stars = 2;
    }
    let grade = "C";
    if (ratio >= 1.2) {
      grade = "S";
    } else if (ratio >= 1.0) {
      grade = "A";
    } else if (ratio >= 0.75) {
      grade = "B";
    }
    return { stars, grade, ratio };
  }

  function finalizePuzzleRun(puzzle, run, finishedAt, options) {
    const solved = !options || options.solved !== false;
    const base = puzzleBaseScore(puzzle);
    const parSeconds = puzzleParSeconds(puzzle);
    const end = Number.isFinite(finishedAt) ? finishedAt : nowMs();
    const start = Number.isFinite(run && run.startedAt) ? run.startedAt : end;
    const elapsedMs = Math.max(0, end - start);
    const elapsedSec = Math.max(1, Math.round(elapsedMs / 1000));
    const mistakes = Math.max(0, Number(run && run.mistakes) || 0);
    const hintsUsed = Math.max(0, Number(run && run.hintsUsed) || 0);

    if (!solved) {
      return {
        ...run,
        finishedAt: end,
        elapsedMs,
        solved: false,
        score: 0,
        stars: 0,
        grade: "F",
        ratio: 0,
        bonusBreakdown: {
          base,
          timeBonus: 0,
          cleanBonus: 0,
          noHintBonus: 0,
          mistakePenalty: 0,
          hintPenalty: 0,
        },
      };
    }

    const speedRatio = Math.max(0, (parSeconds - elapsedSec) / Math.max(1, parSeconds));
    const timeBonus = Math.round(base * 0.35 * speedRatio);
    const cleanBonus = mistakes === 0 ? Math.round(base * 0.12) : 0;
    const noHintBonus = hintsUsed === 0 ? Math.round(base * 0.12) : 0;
    const mistakePenalty = Math.round(base * 0.1 * mistakes);
    const hintPenalty = Math.round(base * 0.08 * hintsUsed);
    const rawScore = base + timeBonus + cleanBonus + noHintBonus - mistakePenalty - hintPenalty;
    const scoreFloor = Math.round(base * 0.35);
    const score = Math.max(scoreFloor, rawScore);
    const rank = deriveStarsAndGrade(score, base, true);

    return {
      ...run,
      finishedAt: end,
      elapsedMs,
      solved: true,
      score,
      stars: rank.stars,
      grade: rank.grade,
      ratio: rank.ratio,
      bonusBreakdown: {
        base,
        timeBonus,
        cleanBonus,
        noHintBonus,
        mistakePenalty,
        hintPenalty,
      },
    };
  }

  function emptyPuzzleRecord() {
    return {
      attempts: 0,
      clears: 0,
      fails: 0,
      totalMistakes: 0,
      totalHintsUsed: 0,
      bestScore: 0,
      bestStars: 0,
      bestGrade: null,
      fastestClearMs: null,
      lastPlayedAt: 0,
      lastResult: null,
    };
  }

  function getPuzzleRecord(progress, puzzleId) {
    const record = progress && progress.puzzles ? progress.puzzles[puzzleId] : null;
    return {
      ...emptyPuzzleRecord(),
      ...(record || {}),
    };
  }

  function applyPuzzleResult(progress, puzzle, runResult) {
    const next = cloneProgress(progress || createEmptyProgress());
    const puzzleId = (puzzle && puzzle.id) || runResult.puzzleId;
    if (!puzzleId) {
      return next;
    }
    const prev = getPuzzleRecord(next, puzzleId);
    const solved = Boolean(runResult && runResult.solved);
    const nextRecord = {
      ...prev,
      attempts: prev.attempts + 1,
      clears: prev.clears + (solved ? 1 : 0),
      fails: prev.fails + (solved ? 0 : 1),
      totalMistakes: prev.totalMistakes + (runResult.mistakes || 0),
      totalHintsUsed: prev.totalHintsUsed + (runResult.hintsUsed || 0),
      lastPlayedAt: runResult.finishedAt || nowMs(),
      lastResult: {
        solved,
        score: runResult.score || 0,
        stars: runResult.stars || 0,
        grade: runResult.grade || "F",
        elapsedMs: runResult.elapsedMs || 0,
        mistakes: runResult.mistakes || 0,
        hintsUsed: runResult.hintsUsed || 0,
      },
    };

    if (solved) {
      nextRecord.bestScore = Math.max(prev.bestScore || 0, runResult.score || 0);
      nextRecord.bestStars = Math.max(prev.bestStars || 0, runResult.stars || 0);
      if (nextRecord.bestScore === (runResult.score || 0)) {
        nextRecord.bestGrade = runResult.grade || prev.bestGrade;
      } else {
        nextRecord.bestGrade = prev.bestGrade || runResult.grade || null;
      }
      if ((runResult.elapsedMs || 0) > 0) {
        nextRecord.fastestClearMs =
          prev.fastestClearMs == null ? runResult.elapsedMs : Math.min(prev.fastestClearMs, runResult.elapsedMs);
      }
    }

    next.puzzles[puzzleId] = nextRecord;
    next.profile.totalPuzzleAttempts += 1;
    if (solved) {
      next.profile.totalPuzzleClears += 1;
      next.profile.totalPuzzleScore += runResult.score || 0;
    }
    next.profile.updatedAt = runResult.finishedAt || nowMs();
    next.profile.lastPlayedMode = "puzzle";
    return next;
  }

  function emptyLessonRecord() {
    return {
      views: 0,
      maxStepReached: 0,
      completed: false,
      lastViewedAt: 0,
      lastStep: 0,
    };
  }

  function getLessonRecord(progress, lessonId) {
    const record = progress && progress.lessons ? progress.lessons[lessonId] : null;
    return {
      ...emptyLessonRecord(),
      ...(record || {}),
    };
  }

  function applyLessonProgress(progress, lessonId, stepIndex, totalSteps, timestampMs) {
    if (!lessonId) {
      return cloneProgress(progress || createEmptyProgress());
    }
    const next = cloneProgress(progress || createEmptyProgress());
    const prev = getLessonRecord(next, lessonId);
    const safeStep = Math.max(0, Number.isFinite(stepIndex) ? stepIndex : 0);
    const safeTotal = Math.max(0, Number.isFinite(totalSteps) ? totalSteps : 0);
    const t = Number.isFinite(timestampMs) ? timestampMs : nowMs();

    next.lessons[lessonId] = {
      ...prev,
      views: prev.views + 1,
      maxStepReached: Math.max(prev.maxStepReached || 0, safeStep),
      completed: Boolean(prev.completed || (safeTotal > 0 && safeStep >= safeTotal)),
      lastViewedAt: t,
      lastStep: safeStep,
    };
    next.profile.totalLessonViews += 1;
    next.profile.updatedAt = t;
    next.profile.lastPlayedMode = "lesson";
    return next;
  }

  return {
    STORAGE_KEY,
    VERSION,
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
  };
});
