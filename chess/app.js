/* global ChessContent, ChessModeCore, ChessGameCore, ChessProgressCore, ChessAI */
(function () {
  const content = typeof ChessContent !== "undefined" ? ChessContent : null;
  const modeCore = typeof ChessModeCore !== "undefined" ? ChessModeCore : null;
  const gameCore = typeof ChessGameCore !== "undefined" ? ChessGameCore : null;
  const progressCore = typeof ChessProgressCore !== "undefined" ? ChessProgressCore : null;
  const aiCore = typeof ChessAI !== "undefined" ? ChessAI : null;

  const els = {
    modeSwitch: document.getElementById("mode-switch"),
    modeButtons: Array.from(document.querySelectorAll(".mode-btn")),
    modeLabel: document.getElementById("mode-label"),
    turnLabel: document.getElementById("turn-label"),
    statusMain: document.getElementById("status-main"),
    statusDetail: document.getElementById("status-detail"),
    resetCurrent: document.getElementById("reset-current"),
    copyFen: document.getElementById("copy-fen"),
    flipBoard: document.getElementById("flip-board"),
    generalMessage: document.getElementById("general-message"),
    aiPanel: document.getElementById("panel-ai"),
    aiSide: document.getElementById("ai-side"),
    aiDepth: document.getElementById("ai-depth"),
    aiStartNew: document.getElementById("ai-start-new"),
    aiForceMove: document.getElementById("ai-force-move"),
    aiProgressTrack: document.getElementById("ai-progress-track"),
    aiProgressBar: document.getElementById("ai-progress-bar"),
    aiMessage: document.getElementById("ai-message"),
    puzzlePanel: document.getElementById("panel-puzzle"),
    puzzleTier: document.getElementById("puzzle-tier"),
    puzzleIndex: document.getElementById("puzzle-index"),
    puzzleStart: document.getElementById("puzzle-start"),
    puzzleNext: document.getElementById("puzzle-next"),
    puzzleHint: document.getElementById("puzzle-hint"),
    puzzleClearStats: document.getElementById("puzzle-clear-stats"),
    puzzleRunMistakes: document.getElementById("puzzle-run-mistakes"),
    puzzleRunHints: document.getElementById("puzzle-run-hints"),
    puzzleBestScore: document.getElementById("puzzle-best-score"),
    puzzleBestStars: document.getElementById("puzzle-best-stars"),
    puzzleScoreResult: document.getElementById("puzzle-score-result"),
    puzzleHintText: document.getElementById("puzzle-hint-text"),
    puzzleGoal: document.getElementById("puzzle-goal"),
    puzzleMessage: document.getElementById("puzzle-message"),
    lessonPanel: document.getElementById("panel-lesson"),
    lessonSectionFilter: document.getElementById("lesson-section-filter"),
    lessonSelect: document.getElementById("lesson-select"),
    lessonReset: document.getElementById("lesson-reset"),
    lessonPrev: document.getElementById("lesson-prev"),
    lessonNext: document.getElementById("lesson-next"),
    lessonProgress: document.getElementById("lesson-progress"),
    lessonMeta: document.getElementById("lesson-meta"),
    lessonNote: document.getElementById("lesson-note"),
    errorBanner: document.getElementById("error-banner"),
    moveAnimLayer: document.getElementById("move-anim-layer"),
    board: document.getElementById("board"),
    promotionPicker: document.getElementById("promotion-picker"),
    promotionButtons: Array.from(document.querySelectorAll("[data-promotion]")),
    promotionCancel: document.getElementById("promotion-cancel"),
    moveList: document.getElementById("move-list"),
    historyCaption: document.getElementById("history-caption"),
  };

  if (!content || !modeCore || !gameCore || !progressCore || !aiCore) {
    if (els.errorBanner) {
      els.errorBanner.classList.remove("hidden");
      els.errorBanner.textContent = "脚本加载失败：缺少内容/模式/进度/AI/棋盘模块。";
    }
    return;
  }

  const { PUZZLE_TIERS, LESSONS } = content;
  const MODE_LABELS = {
    pvp: "双人对弈",
    ai: "人机对弈",
    puzzle: "闯关模式",
    lesson: "棋局讲解",
  };

  const state = {
    chess: null,
    selectedSquare: null,
    legalMoves: [],
    lastMoveSquares: new Set(),
    modeState: modeCore.createModeState(),
    lessonState: modeCore.createLessonState(LESSONS),
    lessonFilter: "all",
    progress: progressCore.createEmptyProgress(),
    progressStorageOk: true,
    ai: {
      side: "b",
      depth: 3,
      thinking: false,
      requestToken: 0,
      lastDecisionText: "",
      lastThinkMs: 0,
      thinkingStartedAt: 0,
    },
    puzzleRuntime: {
      cursor: 0,
      status: "idle",
      message: "",
      run: null,
      revealedHints: 0,
      hintText: "",
      scoreSummaryText: "",
      lastResult: null,
    },
    pendingPromotion: null,
    ui: {
      generalMessage: "提示：支持翻转棋盘与兵升变选择。",
      errorMessage: "",
      boardOrientation: "w",
      queuedMoveAnimation: null,
    },
  };

  function currentMode() {
    return state.modeState.mode;
  }

  function getActiveLesson() {
    const filtered = getFilteredLessons();
    return filtered.find((lesson) => lesson.id === state.lessonState.activeLessonId) || filtered[0] || null;
  }

  function getFilteredLessons() {
    if (state.lessonFilter === "all") {
      return LESSONS.slice();
    }
    return LESSONS.filter(function (lesson) {
      return lesson.section === state.lessonFilter;
    });
  }

  function getLocalStorageSafe() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage;
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  function loadProgressState() {
    const storage = getLocalStorageSafe();
    state.progress = progressCore.loadProgress(storage);
    state.progressStorageOk = Boolean(storage);
  }

  function saveProgressState() {
    const storage = getLocalStorageSafe();
    const ok = progressCore.saveProgress(storage, state.progress);
    state.progressStorageOk = ok || storage == null;
    return ok;
  }

  function getPuzzleTierList() {
    return PUZZLE_TIERS[state.modeState.puzzle.tier] || [];
  }

  function getActivePuzzle() {
    const list = getPuzzleTierList();
    return list[state.modeState.puzzle.currentIndex] || null;
  }

  function getActivePuzzleRecord() {
    const puzzle = getActivePuzzle();
    if (!puzzle) {
      return null;
    }
    return progressCore.getPuzzleRecord(state.progress, puzzle.id);
  }

  function startPuzzleRun(puzzle) {
    state.puzzleRuntime.run = puzzle ? progressCore.beginPuzzleRun(puzzle) : null;
    state.puzzleRuntime.revealedHints = 0;
    state.puzzleRuntime.hintText = "";
    state.puzzleRuntime.scoreSummaryText = "";
    state.puzzleRuntime.lastResult = null;
  }

  function finalizePuzzleRunIfNeeded(options) {
    const puzzle = getActivePuzzle();
    const run = state.puzzleRuntime.run;
    if (!puzzle || !run) {
      return null;
    }
    if (run.finishedAt) {
      return run;
    }
    const result = progressCore.finalizePuzzleRun(puzzle, run, Date.now(), options || {});
    state.puzzleRuntime.run = result;
    state.puzzleRuntime.lastResult = result;
    state.progress = progressCore.applyPuzzleResult(state.progress, puzzle, result);
    saveProgressState();
    return result;
  }

  function closePuzzleRunAsFailedIfActive() {
    if (currentMode() !== "puzzle") {
      return;
    }
    if (state.puzzleRuntime.status === "solved") {
      return;
    }
    const run = state.puzzleRuntime.run;
    if (!run || run.finishedAt) {
      return;
    }
    finalizePuzzleRunIfNeeded({ solved: false });
  }

  function revealNextPuzzleHint() {
    const puzzle = getActivePuzzle();
    if (!puzzle || !state.puzzleRuntime.run) {
      return;
    }
    const hints = Array.isArray(puzzle.hints) ? puzzle.hints : [];
    if (hints.length === 0) {
      state.puzzleRuntime.hintText = "该题暂无提示。";
      return;
    }
    const nextIndex = Math.min(state.puzzleRuntime.revealedHints, hints.length - 1);
    const alreadyMax = state.puzzleRuntime.revealedHints >= hints.length;
    if (!alreadyMax) {
      state.puzzleRuntime.run = progressCore.recordPuzzleHint(state.puzzleRuntime.run);
      state.puzzleRuntime.revealedHints += 1;
    }
    state.puzzleRuntime.hintText = `提示 ${nextIndex + 1}/${hints.length}：${hints[nextIndex]}`;
  }

  function starText(count) {
    if (!count || count <= 0) {
      return "-";
    }
    return "★".repeat(count) + "☆".repeat(Math.max(0, 3 - count));
  }

  function sectionLabel(section) {
    const map = {
      "opening-attack": "开局进攻",
      "tactical-combination": "战术组合",
      "initiative-attack": "主动进攻",
      "positional-play": "位置运营",
      "endgame-technique": "残局技巧",
    };
    return map[section] || section;
  }

  function queueMoveAnimation(payload) {
    state.ui.queuedMoveAnimation = payload;
  }

  function getSquareButton(square) {
    return els.board.querySelector(`button[data-square="${square}"]`);
  }

  function playQueuedMoveAnimation() {
    const payload = state.ui.queuedMoveAnimation;
    if (!payload || !els.moveAnimLayer) {
      state.ui.queuedMoveAnimation = null;
      return;
    }
    state.ui.queuedMoveAnimation = null;
    const fromBtn = getSquareButton(payload.from);
    const toBtn = getSquareButton(payload.to);
    if (!fromBtn || !toBtn) {
      return;
    }
    const shellRect = els.moveAnimLayer.getBoundingClientRect();
    const fromRect = fromBtn.getBoundingClientRect();
    const toRect = toBtn.getBoundingClientRect();
    const size = Math.min(fromRect.width, fromRect.height);
    const pieceEl = document.createElement("div");
    pieceEl.className = "move-anim-piece";
    pieceEl.textContent = payload.glyph || "";
    pieceEl.style.setProperty("--size", `${size}px`);
    pieceEl.style.setProperty("--from-x", `${fromRect.left - shellRect.left}px`);
    pieceEl.style.setProperty("--from-y", `${fromRect.top - shellRect.top}px`);
    pieceEl.style.setProperty("--to-x", `${toRect.left - shellRect.left}px`);
    pieceEl.style.setProperty("--to-y", `${toRect.top - shellRect.top}px`);
    els.moveAnimLayer.appendChild(pieceEl);
    window.requestAnimationFrame(function () {
      pieceEl.classList.add("is-enter");
    });
    window.setTimeout(function () {
      pieceEl.remove();
    }, 220);
  }

  function setError(message) {
    state.ui.errorMessage = message || "";
    renderError();
  }

  function setGeneralMessage(message) {
    state.ui.generalMessage = message || "";
    if (els.generalMessage) {
      els.generalMessage.textContent = state.ui.generalMessage;
    }
  }

  function clearSelection() {
    state.selectedSquare = null;
    state.legalMoves = [];
  }

  function clearPendingPromotion() {
    state.pendingPromotion = null;
  }

  function getBoardOrientation() {
    return state.ui.boardOrientation === "b" ? "b" : "w";
  }

  function toggleBoardOrientation() {
    state.ui.boardOrientation = getBoardOrientation() === "w" ? "b" : "w";
  }

  function syncBoardOrientationForContext() {
    if (currentMode() === "ai") {
      state.ui.boardOrientation = state.ai.side === "w" ? "b" : "w";
      return;
    }
    state.ui.boardOrientation = "w";
  }

  function syncLastMoveSquares() {
    if (!state.chess) {
      state.lastMoveSquares = new Set();
      return;
    }
    state.lastMoveSquares = gameCore.getLastMoveSquareSet(state.chess);
  }

  function cancelAiThinking() {
    state.ai.requestToken += 1;
    state.ai.thinking = false;
  }

  function hasEngine() {
    return Boolean(state.chess);
  }

  function createFreshGame() {
    closePuzzleRunAsFailedIfActive();
    clearSelection();
    clearPendingPromotion();
    state.chess = gameCore.createEngine();
    syncLastMoveSquares();
    state.puzzleRuntime.run = null;
  }

  function resetPuzzleTracking() {
    state.puzzleRuntime.cursor = 0;
    state.puzzleRuntime.status = "idle";
    state.puzzleRuntime.message = "";
    state.puzzleRuntime.hintText = "";
    state.puzzleRuntime.scoreSummaryText = "";
    state.puzzleRuntime.lastResult = null;
    state.puzzleRuntime.revealedHints = 0;
  }

  function loadPuzzlePosition(indexOverride) {
    closePuzzleRunAsFailedIfActive();
    const tier = state.modeState.puzzle.tier;
    const list = PUZZLE_TIERS[tier] || [];
    const currentIndex = Number.isInteger(indexOverride) ? indexOverride : state.modeState.puzzle.currentIndex;
    state.modeState = modeCore.startPuzzle(state.modeState, PUZZLE_TIERS, currentIndex);

    const puzzle = getActivePuzzle();
    clearSelection();
    clearPendingPromotion();
    resetPuzzleTracking();

    if (!puzzle) {
      state.chess = null;
      state.puzzleRuntime.status = "empty";
      state.puzzleRuntime.message = "当前分类暂无题目。";
      return;
    }

    try {
      state.chess = gameCore.createGameFromSetup(puzzle.setupMoves);
      syncLastMoveSquares();
      state.puzzleRuntime.status = "active";
      state.puzzleRuntime.message = "按教学线路完成将杀。点击棋子开始。";
      startPuzzleRun(puzzle);
      if (typeof state.chess.turn === "function" && state.chess.turn() !== puzzle.sideToMove) {
        state.puzzleRuntime.message = "题库配置提示：轮到方与题目设定不一致。";
      }
    } catch (error) {
      state.chess = null;
      state.puzzleRuntime.status = "error";
      state.puzzleRuntime.message = "题目加载失败。";
      setError(`闯关题库解析失败：${error.message}`);
    }
  }

  function loadLessonPosition() {
    const lesson = getActiveLesson();
    clearSelection();
    clearPendingPromotion();
    if (!lesson) {
      state.chess = null;
      return;
    }
    try {
      state.chess = gameCore.replayLesson(lesson, state.lessonState.stepIndex);
      syncLastMoveSquares();
      state.progress = progressCore.applyLessonProgress(
        state.progress,
        lesson.id,
        state.lessonState.stepIndex,
        lesson.moves.length,
        Date.now()
      );
      saveProgressState();
    } catch (error) {
      state.chess = null;
      setError(`讲解棋局解析失败：${error.message}`);
    }
  }

  function restartCurrentMode() {
    cancelAiThinking();
    clearSelection();
    clearPendingPromotion();
    syncBoardOrientationForContext();
    setError("");

    if (currentMode() === "puzzle") {
      loadPuzzlePosition();
      render();
      return;
    }

    if (currentMode() === "lesson") {
      state.lessonState = modeCore.selectLesson(
        { activeLessonId: state.lessonState.activeLessonId, stepIndex: 0 },
        LESSONS,
        state.lessonState.activeLessonId
      );
      loadLessonPosition();
      render();
      return;
    }

    try {
      createFreshGame();
    } catch (error) {
      setError(error.message);
      render();
      return;
    }

    if (currentMode() === "ai") {
      state.ai.lastDecisionText = "";
      maybeScheduleAiMove();
    }

    render();
  }

  function setMode(mode) {
    if (!MODE_LABELS[mode]) {
      return;
    }
    if (currentMode() === "puzzle" && mode !== "puzzle") {
      closePuzzleRunAsFailedIfActive();
    }
    cancelAiThinking();
    clearSelection();
    clearPendingPromotion();
    setError("");
    state.modeState = modeCore.setGameMode(state.modeState, mode);
    state.ai.lastDecisionText = "";
    syncBoardOrientationForContext();
    state.progress.profile.lastPlayedMode = mode;
    state.progress.profile.updatedAt = Date.now();
    saveProgressState();

    try {
      if (mode === "puzzle") {
        loadPuzzlePosition();
      } else if (mode === "lesson") {
        loadLessonPosition();
      } else {
        createFreshGame();
        if (mode === "ai") {
          maybeScheduleAiMove();
        }
      }
    } catch (error) {
      setError(error.message);
    }

    render();
  }

  function fillSelect(selectEl, options, selectedValue) {
    if (!selectEl) {
      return;
    }
    const currentHtml = options.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join("");
    if (selectEl.innerHTML !== currentHtml) {
      selectEl.innerHTML = currentHtml;
    }
    if (selectedValue != null) {
      selectEl.value = String(selectedValue);
    }
  }

  function canHumanMoveNow() {
    if (!state.chess || !hasEngine()) {
      return false;
    }
    if (state.pendingPromotion) {
      return false;
    }
    if (state.ai.thinking) {
      return false;
    }
    if (currentMode() === "lesson") {
      return false;
    }
    if (currentMode() === "ai" && typeof state.chess.turn === "function" && state.chess.turn() === state.ai.side) {
      return false;
    }
    if (currentMode() === "puzzle") {
      if (state.puzzleRuntime.status !== "active") {
        return false;
      }
      const puzzle = getActivePuzzle();
      if (!puzzle) {
        return false;
      }
      const expected = puzzle.solutionLine[state.puzzleRuntime.cursor];
      if (!expected || expected.actor !== "player") {
        return false;
      }
      if (typeof state.chess.turn === "function" && state.chess.turn() !== puzzle.sideToMove) {
        return false;
      }
    }
    return !gameCore.isGameOver(state.chess);
  }

  function getSelectablePiece(square) {
    if (!state.chess) {
      return null;
    }
    const piece = gameCore.getPieceAtSquare(state.chess, square);
    if (!piece) {
      return null;
    }
    if (typeof state.chess.turn !== "function" || piece.color !== state.chess.turn()) {
      return null;
    }
    return piece;
  }

  function selectSquare(square) {
    state.selectedSquare = square;
    state.legalMoves = gameCore.getLegalMovesFrom(state.chess, square);
  }

  function tryApplyMove(fromSquare, toSquare, preferredPromotion) {
    if (!preferredPromotion) {
      const promotionMoves = gameCore.getPromotionMoves(state.chess, fromSquare, toSquare);
      if (promotionMoves.length > 1) {
        const options = Array.from(
          new Set(
            promotionMoves
              .map(function (move) {
                return move.promotion;
              })
              .filter(Boolean)
          )
        );
        state.pendingPromotion = {
          from: fromSquare,
          to: toSquare,
          options: options.length > 0 ? options : ["q"],
          color: typeof state.chess.turn === "function" ? state.chess.turn() : "w",
        };
        render();
        return "pending";
      }
    }

    const chosen = gameCore.chooseMoveFromVerboseList(state.chess, fromSquare, toSquare, preferredPromotion || "q");
    if (!chosen) {
      return false;
    }

    const moveSpec = {
      from: chosen.from,
      to: chosen.to,
    };
    if (chosen.promotion) {
      moveSpec.promotion = chosen.promotion;
    }

    const movingGlyph =
      gameCore.UNICODE_PIECES[
        `${(chosen.color || (typeof state.chess.turn === "function" ? state.chess.turn() : "w"))}${
          moveSpec.promotion || chosen.piece || ""
        }`
      ] || "";
    queueMoveAnimation({ from: chosen.from, to: chosen.to, glyph: movingGlyph });

    const result = state.chess.move(moveSpec);
    if (!result) {
      queueMoveAnimation(null);
      return false;
    }

    clearSelection();
    clearPendingPromotion();
    syncLastMoveSquares();
    setError("");

    if (currentMode() === "puzzle") {
      handlePuzzleMove(result);
      return true;
    }

    if (currentMode() === "ai") {
      maybeScheduleAiMove();
    }

    render();
    return true;
  }

  function handlePuzzleMove(result) {
    const puzzle = getActivePuzzle();
    if (!puzzle) {
      render();
      return;
    }

    const expected = puzzle.solutionLine[state.puzzleRuntime.cursor];
    if (!expected || expected.actor !== "player") {
      state.chess.undo();
      syncLastMoveSquares();
      state.puzzleRuntime.message = "当前不是玩家走棋步骤。";
      render();
      return;
    }

    if (!gameCore.sanMatches(result.san, expected.san)) {
      if (state.puzzleRuntime.run && !state.puzzleRuntime.run.finishedAt) {
        state.puzzleRuntime.run = progressCore.recordPuzzleMistake(state.puzzleRuntime.run);
      }
      state.chess.undo();
      syncLastMoveSquares();
      const mistakes = state.puzzleRuntime.run ? state.puzzleRuntime.run.mistakes : 0;
      const puzzleHints = Array.isArray(puzzle.hints) ? puzzle.hints : [];
      if (mistakes >= 2 && state.puzzleRuntime.revealedHints < puzzleHints.length) {
        revealNextPuzzleHint();
      }
      state.puzzleRuntime.message = `这步不是题解线路（错误 ${mistakes} 次）。请继续尝试。`;
      render();
      return;
    }

    state.modeState = modeCore.recordPuzzlePlayerMove(state.modeState, result.san);
    state.puzzleRuntime.cursor += 1;
    state.puzzleRuntime.message = `正确：${result.san}`;

    while (state.puzzleRuntime.cursor < puzzle.solutionLine.length) {
      const autoStep = puzzle.solutionLine[state.puzzleRuntime.cursor];
      if (!autoStep || autoStep.actor !== "opponent") {
        break;
      }
      const autoMove = state.chess.move(autoStep.san);
      if (!autoMove) {
        state.puzzleRuntime.status = "error";
        state.puzzleRuntime.message = "题库中的对手应手无法执行。";
        setError(`闯关题库应手非法：${autoStep.san}（${puzzle.id}）`);
        break;
      }
      state.modeState = modeCore.recordPuzzleOpponentMove(state.modeState, autoMove.san);
      state.puzzleRuntime.cursor += 1;
      syncLastMoveSquares();
      state.puzzleRuntime.message = `对手应手：${autoMove.san}`;
    }

    if (state.puzzleRuntime.cursor >= puzzle.solutionLine.length) {
      state.puzzleRuntime.status = "solved";
      const checkmate = gameCore.isCheckmate(state.chess);
      const finalRun = finalizePuzzleRunIfNeeded({ solved: true });
      if (finalRun) {
        state.puzzleRuntime.scoreSummaryText = `得分 ${finalRun.score}｜${starText(finalRun.stars)}｜评级 ${finalRun.grade}`;
      }
      state.puzzleRuntime.message = checkmate ? "过关成功：完成将杀！" : "线路完成。";
    }

    render();
  }

  function maybeScheduleAiMove(force) {
    if (currentMode() !== "ai" || !state.chess) {
      return;
    }
    if (gameCore.isGameOver(state.chess)) {
      render();
      return;
    }
    if (typeof state.chess.turn !== "function" || state.chess.turn() !== state.ai.side) {
      if (force) {
        state.ai.lastDecisionText = "当前不是 AI 回合。";
      }
      render();
      return;
    }
    if (state.ai.thinking) {
      if (force) {
        state.ai.lastDecisionText = "AI 已在思考中。";
      }
      render();
      return;
    }

    state.ai.thinking = true;
    state.ai.thinkingStartedAt = Date.now();
    const token = ++state.ai.requestToken;
    const depth = state.ai.depth;
    render();

    window.setTimeout(function () {
      if (token !== state.ai.requestToken || currentMode() !== "ai" || !state.chess) {
        return;
      }

      try {
        const startedAt =
          typeof performance !== "undefined" && typeof performance.now === "function"
            ? performance.now()
            : Date.now();
        const best = aiCore.findBestMove(state.chess, {
          depth: depth,
          side: state.ai.side,
        });
        const endedAt =
          typeof performance !== "undefined" && typeof performance.now === "function"
            ? performance.now()
            : Date.now();
        state.ai.lastThinkMs = Math.max(0, Math.round(endedAt - startedAt));

        if (!best) {
          state.ai.lastDecisionText = "AI 无可走着法。";
          state.ai.thinking = false;
          state.ai.thinkingStartedAt = 0;
          render();
          return;
        }

        const move = state.chess.move({
          from: best.from,
          to: best.to,
          promotion: best.promotion,
        });
        state.ai.thinking = false;
        state.ai.thinkingStartedAt = 0;

        if (!move) {
          state.ai.lastDecisionText = "AI 走子失败（非法着法）。";
          render();
          return;
        }

        syncLastMoveSquares();
        state.ai.lastDecisionText = `AI：${move.san}（深度 ${best.searchedDepth || depth}，评分 ${Math.round(best.score || 0)}）`;
        render();
      } catch (error) {
        state.ai.thinking = false;
        state.ai.thinkingStartedAt = 0;
        setError(`AI 计算失败：${error.message}`);
        render();
      }
    }, 30);
  }

  function handleSquareClick(square) {
    if (!canHumanMoveNow()) {
      return;
    }

    const legalTargets = new Set(state.legalMoves.map((move) => move.to));

    if (state.selectedSquare && legalTargets.has(square)) {
      tryApplyMove(state.selectedSquare, square);
      return;
    }

    if (state.selectedSquare === square) {
      clearSelection();
      render();
      return;
    }

    const piece = getSelectablePiece(square);
    if (piece) {
      selectSquare(square);
      render();
      return;
    }

    clearSelection();
    render();
  }

  function renderError() {
    if (!els.errorBanner) {
      return;
    }
    if (state.ui.errorMessage) {
      els.errorBanner.classList.remove("hidden");
      els.errorBanner.textContent = state.ui.errorMessage;
    } else {
      els.errorBanner.classList.add("hidden");
      els.errorBanner.textContent = "";
    }
  }

  function renderModeButtons() {
    for (const button of els.modeButtons) {
      const active = button.dataset.mode === currentMode();
      button.classList.toggle("is-active", active);
    }
    els.modeLabel.textContent = MODE_LABELS[currentMode()] || "-";
    els.aiPanel.classList.toggle("hidden", currentMode() !== "ai");
    els.puzzlePanel.classList.toggle("hidden", currentMode() !== "puzzle");
    els.lessonPanel.classList.toggle("hidden", currentMode() !== "lesson");
  }

  function renderStatus() {
    if (!state.chess) {
      els.turnLabel.textContent = "-";
      els.statusMain.textContent = "未就绪";
      els.statusDetail.textContent = "请检查脚本加载";
      return;
    }

    const pos = gameCore.getPositionStatus(state.chess);
    els.turnLabel.textContent = pos.turn === "w" ? "白方" : "黑方";

    if (currentMode() === "lesson") {
      const lesson = getActiveLesson();
      const total = lesson ? lesson.moves.length : 0;
      els.statusMain.textContent = "讲解回放";
      els.statusDetail.textContent = `第 ${state.lessonState.stepIndex}/${total} 半回合`;
      return;
    }

    if (currentMode() === "puzzle") {
      const puzzle = getActivePuzzle();
      els.statusMain.textContent = puzzle ? puzzle.goalLabel : "闯关";
      els.statusDetail.textContent = state.puzzleRuntime.status === "solved" ? "已过关" : pos.statusText;
      return;
    }

    els.statusMain.textContent = pos.statusText;
    if (currentMode() === "ai" && state.ai.thinking) {
      els.statusDetail.textContent = `AI 思考中（深度 ${state.ai.depth}）`;
    } else {
      els.statusDetail.textContent = pos.detailText;
    }
  }

  function renderBoard() {
    const selected = state.selectedSquare;
    const legalTargets = new Set(state.legalMoves.map((move) => move.to));
    const lastSquares = state.lastMoveSquares || new Set();
    let checkSquare = null;

    if (state.chess && gameCore.isInCheck(state.chess) && typeof state.chess.turn === "function") {
      checkSquare = gameCore.findKingSquare(state.chess, state.chess.turn());
    }

    const orientation = getBoardOrientation();
    const baseSquares = state.chess ? gameCore.getBoardSquares(state.chess) : buildEmptySquares();
    const squares = orientation === "b" ? baseSquares.slice().reverse() : baseSquares;
    const boardDisabled = !canHumanMoveNow();

    els.board.innerHTML = "";

    for (const cell of squares) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `sq ${cell.colorClass}`;
      btn.dataset.square = cell.square;
      btn.setAttribute("aria-label", `${cell.square}${cell.piece ? ` ${cell.piece.color}${cell.piece.type}` : ""}`);
      btn.disabled = boardDisabled;

      if (selected === cell.square) {
        btn.classList.add("is-selected");
      }
      if (legalTargets.has(cell.square)) {
        btn.classList.add("is-target");
      }
      if (lastSquares.has(cell.square)) {
        btn.classList.add("is-last");
      }
      if (checkSquare === cell.square) {
        btn.classList.add("is-check");
      }

      if (cell.piece) {
        btn.textContent = cell.piece.glyph;
      }

      const isBottomEdge = orientation === "w" ? cell.rank === 1 : cell.rank === 8;
      const isLeftEdge = orientation === "w" ? cell.file === "a" : cell.file === "h";

      if (isBottomEdge) {
        const fileTag = document.createElement("span");
        fileTag.className = "coord-file";
        fileTag.textContent = cell.file;
        btn.appendChild(fileTag);
      }

      if (isLeftEdge) {
        const rankTag = document.createElement("span");
        rankTag.className = "coord-rank";
        rankTag.textContent = String(cell.rank);
        btn.appendChild(rankTag);
      }

      els.board.appendChild(btn);
    }

    playQueuedMoveAnimation();
  }

  function buildEmptySquares() {
    const result = [];
    for (let rank = 8; rank >= 1; rank -= 1) {
      for (let col = 0; col < 8; col += 1) {
        const file = gameCore.FILES[col];
        const rowIndex = 8 - rank;
        result.push({
          square: `${file}${rank}`,
          file,
          rank,
          colorClass: (rowIndex + col) % 2 === 0 ? "light" : "dark",
          piece: null,
        });
      }
    }
    return result;
  }

  function renderHistory() {
    const rows = state.chess ? gameCore.getMoveHistory(state.chess) : [];
    els.moveList.innerHTML = "";
    for (const row of rows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${row.moveNumber}</td><td>${row.white || ""}</td><td>${row.black || ""}</td>`;
      els.moveList.appendChild(tr);
    }

    if (currentMode() === "lesson") {
      const lesson = getActiveLesson();
      els.historyCaption.textContent = lesson
        ? `回放：${lesson.title}（${state.lessonState.stepIndex}/${lesson.moves.length}）`
        : "无棋局";
      return;
    }

    if (currentMode() === "puzzle") {
      const puzzle = getActivePuzzle();
      els.historyCaption.textContent = puzzle ? `闯关：${puzzle.title}` : "闯关";
      return;
    }

    els.historyCaption.textContent = "实时更新";
  }

  function renderAiPanel() {
    els.aiSide.value = state.ai.side;
    els.aiDepth.value = String(state.ai.depth);
    const liveMs = state.ai.thinking && state.ai.thinkingStartedAt ? Date.now() - state.ai.thinkingStartedAt : 0;
    const timingMs = state.ai.thinking ? liveMs : state.ai.lastThinkMs;
    const timing = timingMs > 0 ? `，耗时 ${Math.max(0, Math.round(timingMs))}ms` : "";
    const base = state.ai.thinking ? `AI 正在搜索（深度 ${state.ai.depth}）...` : state.ai.lastDecisionText;
    els.aiMessage.textContent = base || "可切换执子与深度后开始新对局。";
    if (!state.ai.thinking && state.ai.lastDecisionText && timing) {
      els.aiMessage.textContent += timing;
    }
    if (state.ai.thinking && timing) {
      els.aiMessage.textContent += timing;
    }
    if (els.aiProgressTrack) {
      els.aiProgressTrack.classList.toggle("is-thinking", state.ai.thinking);
    }
    els.aiForceMove.disabled = !state.chess || currentMode() !== "ai";
  }

  function renderPuzzlePanel() {
    els.puzzleTier.value = state.modeState.puzzle.tier;
    const list = getPuzzleTierList();
    const options = list.map(function (item, index) {
      return {
        value: String(index),
        label: `${index + 1}. ${item.title}`,
      };
    });
    fillSelect(els.puzzleIndex, options, String(state.modeState.puzzle.currentIndex));

    const puzzle = getActivePuzzle();
    const record = getActivePuzzleRecord();
    const run = state.puzzleRuntime.run;
    if (els.puzzleRunMistakes) {
      els.puzzleRunMistakes.textContent = String((run && run.mistakes) || 0);
    }
    if (els.puzzleRunHints) {
      els.puzzleRunHints.textContent = String((run && run.hintsUsed) || 0);
    }
    if (els.puzzleBestScore) {
      els.puzzleBestScore.textContent = record && record.bestScore ? String(record.bestScore) : "-";
    }
    if (els.puzzleBestStars) {
      els.puzzleBestStars.textContent = record && record.bestStars ? starText(record.bestStars) : "-";
    }
    if (els.puzzleScoreResult) {
      els.puzzleScoreResult.textContent = state.puzzleRuntime.scoreSummaryText || "";
    }
    if (els.puzzleHintText) {
      els.puzzleHintText.textContent = state.puzzleRuntime.hintText || "";
    }

    if (!puzzle) {
      els.puzzleGoal.textContent = "当前分类暂无题目。";
      els.puzzleMessage.textContent = "";
      if (els.puzzleHint) {
        els.puzzleHint.disabled = true;
      }
      if (els.puzzleClearStats) {
        els.puzzleClearStats.disabled = true;
      }
      els.puzzleNext.disabled = true;
      return;
    }

    els.puzzleGoal.textContent = `${puzzle.goalLabel}｜${puzzle.title}：${puzzle.intro}`;
    els.puzzleMessage.textContent = state.puzzleRuntime.message || "点击开始。";
    if (els.puzzleHint) {
      const hints = Array.isArray(puzzle.hints) ? puzzle.hints : [];
      els.puzzleHint.disabled =
        currentMode() !== "puzzle" ||
        state.puzzleRuntime.status === "solved" ||
        !state.puzzleRuntime.run ||
        (hints.length > 0 && state.puzzleRuntime.revealedHints >= hints.length);
    }
    if (els.puzzleClearStats) {
      els.puzzleClearStats.disabled = !record || record.attempts <= 0;
    }
    els.puzzleNext.disabled = list.length <= 1;
  }

  function renderLessonPanel() {
    const allSections = ["all"].concat(
      Array.from(
        new Set(
          LESSONS.map(function (lesson) {
            return lesson.section;
          })
        )
      )
    );
    fillSelect(
      els.lessonSectionFilter,
      allSections.map(function (section) {
        return { value: section, label: section === "all" ? "全部章节" : sectionLabel(section) };
      }),
      state.lessonFilter
    );

    const filteredLessons = getFilteredLessons();
    if (!filteredLessons.some((lesson) => lesson.id === state.lessonState.activeLessonId)) {
      const first = filteredLessons[0] || LESSONS[0] || null;
      state.lessonState = {
        activeLessonId: first ? first.id : null,
        stepIndex: 0,
      };
    }

    const options = filteredLessons.map(function (lesson) {
      return { value: lesson.id, label: `[${sectionLabel(lesson.section)}] ${lesson.title}` };
    });
    fillSelect(els.lessonSelect, options, state.lessonState.activeLessonId);

    const lesson = getActiveLesson();
    if (!lesson) {
      els.lessonProgress.textContent = "暂无讲解棋局。";
      if (els.lessonMeta) {
        els.lessonMeta.textContent = "";
      }
      els.lessonNote.textContent = "";
      return;
    }

    const step = state.lessonState.stepIndex;
    const lessonRecord = progressCore.getLessonRecord(state.progress, lesson.id);
    els.lessonProgress.textContent = `进度：第 ${step}/${lesson.moves.length} 半回合`;
    if (els.lessonMeta) {
      els.lessonMeta.textContent = `章节：${sectionLabel(lesson.section)}｜${lesson.players}｜${lesson.era}｜已学到 ${lessonRecord.maxStepReached}/${lesson.moves.length}`;
    }
    const currentMove = step > 0 ? lesson.moves[step - 1] : null;
    els.lessonNote.textContent = (currentMove && currentMove.note) || (step === 0 ? lesson.summary : `着法：${currentMove.san}`);

    els.lessonPrev.disabled = step <= 0;
    els.lessonNext.disabled = step >= lesson.moves.length;
    els.lessonReset.disabled = step <= 0;
  }

  function renderGeneralPanel() {
    els.generalMessage.textContent = state.ui.generalMessage || "";
    els.resetCurrent.disabled = !state.chess && currentMode() !== "puzzle" && currentMode() !== "lesson";
    if (els.flipBoard) {
      els.flipBoard.textContent = getBoardOrientation() === "w" ? "翻转棋盘（白方视角）" : "翻转棋盘（黑方视角）";
    }
    if (!state.progressStorageOk) {
      els.generalMessage.textContent = `${els.generalMessage.textContent}（本地存档不可用）`;
    }
  }

  function renderPromotionPicker() {
    if (!els.promotionPicker) {
      return;
    }
    const pending = state.pendingPromotion;
    if (!pending) {
      els.promotionPicker.classList.add("hidden");
      return;
    }

    els.promotionPicker.classList.remove("hidden");
    for (const button of els.promotionButtons) {
      const code = button.dataset.promotion;
      button.disabled = !pending.options.includes(code);
      const glyphSpan = button.querySelector(".promo-glyph");
      if (glyphSpan) {
        glyphSpan.textContent = gameCore.UNICODE_PIECES[`${pending.color}${code}`] || "";
      }
    }
  }

  function render() {
    renderModeButtons();
    renderGeneralPanel();
    renderStatus();
    renderBoard();
    renderHistory();
    renderAiPanel();
    renderPuzzlePanel();
    renderLessonPanel();
    renderPromotionPicker();
    renderError();
  }

  function bindEvents() {
    els.modeSwitch.addEventListener("click", function (event) {
      const button = event.target.closest("[data-mode]");
      if (!button) {
        return;
      }
      setMode(button.dataset.mode);
    });

    els.board.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-square]");
      if (!button) {
        return;
      }
      handleSquareClick(button.dataset.square);
    });

    els.resetCurrent.addEventListener("click", function () {
      restartCurrentMode();
    });

    els.copyFen.addEventListener("click", function () {
      if (!state.chess || typeof state.chess.fen !== "function") {
        setGeneralMessage("当前没有可复制的棋局。");
        render();
        return;
      }
      const fen = state.chess.fen();
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard
          .writeText(fen)
          .then(function () {
            setGeneralMessage(`已复制 FEN：${fen}`);
            render();
          })
          .catch(function () {
            setGeneralMessage(`复制失败，可手动复制：${fen}`);
            render();
          });
      } else {
        setGeneralMessage(`当前浏览器不支持剪贴板 API，FEN：${fen}`);
        render();
      }
    });

    els.flipBoard.addEventListener("click", function () {
      toggleBoardOrientation();
      render();
    });

    els.aiSide.addEventListener("change", function () {
      state.ai.side = els.aiSide.value === "w" ? "w" : "b";
      if (currentMode() === "ai") {
        syncBoardOrientationForContext();
      }
      if (currentMode() === "ai") {
        restartCurrentMode();
      } else {
        render();
      }
    });

    els.aiDepth.addEventListener("change", function () {
      state.ai.depth = Math.max(2, Math.min(4, Number(els.aiDepth.value) || 3));
      render();
    });

    els.aiStartNew.addEventListener("click", function () {
      if (currentMode() !== "ai") {
        setMode("ai");
        return;
      }
      restartCurrentMode();
    });

    els.aiForceMove.addEventListener("click", function () {
      if (currentMode() !== "ai") {
        return;
      }
      maybeScheduleAiMove(true);
    });

    els.puzzleTier.addEventListener("change", function () {
      state.modeState = modeCore.setPuzzleTier(state.modeState, els.puzzleTier.value);
      if (currentMode() === "puzzle") {
        loadPuzzlePosition(0);
      }
      render();
    });

    els.puzzleIndex.addEventListener("change", function () {
      const index = Number(els.puzzleIndex.value) || 0;
      if (currentMode() === "puzzle") {
        loadPuzzlePosition(index);
      } else {
        state.modeState = modeCore.startPuzzle(state.modeState, PUZZLE_TIERS, index);
      }
      render();
    });

    els.puzzleStart.addEventListener("click", function () {
      if (currentMode() !== "puzzle") {
        setMode("puzzle");
        return;
      }
      loadPuzzlePosition(Number(els.puzzleIndex.value) || 0);
      render();
    });

    els.puzzleNext.addEventListener("click", function () {
      const list = getPuzzleTierList();
      if (list.length === 0) {
        return;
      }
      const nextIndex = (state.modeState.puzzle.currentIndex + 1) % list.length;
      if (currentMode() !== "puzzle") {
        state.modeState = modeCore.startPuzzle(state.modeState, PUZZLE_TIERS, nextIndex);
        render();
        return;
      }
      loadPuzzlePosition(nextIndex);
      render();
    });

    els.puzzleHint.addEventListener("click", function () {
      if (currentMode() !== "puzzle") {
        return;
      }
      revealNextPuzzleHint();
      render();
    });

    els.puzzleClearStats.addEventListener("click", function () {
      const puzzle = getActivePuzzle();
      if (!puzzle) {
        return;
      }
      const next = { ...state.progress, puzzles: { ...state.progress.puzzles } };
      delete next.puzzles[puzzle.id];
      state.progress = next;
      saveProgressState();
      state.puzzleRuntime.scoreSummaryText = "";
      render();
    });

    els.lessonSectionFilter.addEventListener("change", function () {
      state.lessonFilter = els.lessonSectionFilter.value || "all";
      const first = getFilteredLessons()[0] || LESSONS[0] || null;
      state.lessonState = {
        activeLessonId: first ? first.id : null,
        stepIndex: 0,
      };
      if (currentMode() === "lesson") {
        loadLessonPosition();
      }
      render();
    });

    els.lessonSelect.addEventListener("change", function () {
      state.lessonState = modeCore.selectLesson(state.lessonState, LESSONS, els.lessonSelect.value);
      if (currentMode() === "lesson") {
        loadLessonPosition();
      }
      render();
    });

    els.lessonReset.addEventListener("click", function () {
      state.lessonState = { activeLessonId: state.lessonState.activeLessonId, stepIndex: 0 };
      if (currentMode() === "lesson") {
        loadLessonPosition();
      }
      render();
    });

    els.lessonPrev.addEventListener("click", function () {
      state.lessonState = modeCore.prevLessonStep(state.lessonState);
      if (currentMode() === "lesson") {
        loadLessonPosition();
      }
      render();
    });

    els.lessonNext.addEventListener("click", function () {
      state.lessonState = modeCore.nextLessonStep(state.lessonState, LESSONS);
      if (currentMode() === "lesson") {
        loadLessonPosition();
      }
      render();
    });

    els.promotionPicker.addEventListener("click", function (event) {
      const button = event.target.closest("[data-promotion]");
      if (!button || !state.pendingPromotion) {
        return;
      }
      const pending = state.pendingPromotion;
      tryApplyMove(pending.from, pending.to, button.dataset.promotion);
    });

    els.promotionCancel.addEventListener("click", function () {
      clearPendingPromotion();
      render();
    });
  }

  function init() {
    bindEvents();
    loadProgressState();
    state.lessonFilter = "all";
    syncBoardOrientationForContext();
    try {
      createFreshGame();
    } catch (error) {
      setError(`初始化失败：${error.message}`);
    }
    render();
  }

  init();
})();
