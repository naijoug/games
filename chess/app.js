/* global ChessContent, ChessModeCore, ChessGameCore, ChessAI */
(function () {
  const content = typeof ChessContent !== "undefined" ? ChessContent : null;
  const modeCore = typeof ChessModeCore !== "undefined" ? ChessModeCore : null;
  const gameCore = typeof ChessGameCore !== "undefined" ? ChessGameCore : null;
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
    aiMessage: document.getElementById("ai-message"),
    puzzlePanel: document.getElementById("panel-puzzle"),
    puzzleTier: document.getElementById("puzzle-tier"),
    puzzleIndex: document.getElementById("puzzle-index"),
    puzzleStart: document.getElementById("puzzle-start"),
    puzzleNext: document.getElementById("puzzle-next"),
    puzzleGoal: document.getElementById("puzzle-goal"),
    puzzleMessage: document.getElementById("puzzle-message"),
    lessonPanel: document.getElementById("panel-lesson"),
    lessonSelect: document.getElementById("lesson-select"),
    lessonReset: document.getElementById("lesson-reset"),
    lessonPrev: document.getElementById("lesson-prev"),
    lessonNext: document.getElementById("lesson-next"),
    lessonProgress: document.getElementById("lesson-progress"),
    lessonNote: document.getElementById("lesson-note"),
    errorBanner: document.getElementById("error-banner"),
    board: document.getElementById("board"),
    promotionPicker: document.getElementById("promotion-picker"),
    promotionButtons: Array.from(document.querySelectorAll("[data-promotion]")),
    promotionCancel: document.getElementById("promotion-cancel"),
    moveList: document.getElementById("move-list"),
    historyCaption: document.getElementById("history-caption"),
  };

  if (!content || !modeCore || !gameCore || !aiCore) {
    if (els.errorBanner) {
      els.errorBanner.classList.remove("hidden");
      els.errorBanner.textContent = "脚本加载失败：缺少内容/模式/AI/棋盘模块。";
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
    ai: {
      side: "b",
      depth: 3,
      thinking: false,
      requestToken: 0,
      lastDecisionText: "",
      lastThinkMs: 0,
    },
    puzzleRuntime: {
      cursor: 0,
      status: "idle",
      message: "",
    },
    pendingPromotion: null,
    ui: {
      generalMessage: "提示：支持翻转棋盘与兵升变选择。",
      errorMessage: "",
      boardOrientation: "w",
    },
  };

  function currentMode() {
    return state.modeState.mode;
  }

  function getActiveLesson() {
    return LESSONS.find((lesson) => lesson.id === state.lessonState.activeLessonId) || LESSONS[0] || null;
  }

  function getPuzzleTierList() {
    return PUZZLE_TIERS[state.modeState.puzzle.tier] || [];
  }

  function getActivePuzzle() {
    const list = getPuzzleTierList();
    return list[state.modeState.puzzle.currentIndex] || null;
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
    clearSelection();
    clearPendingPromotion();
    state.chess = gameCore.createEngine();
    syncLastMoveSquares();
  }

  function resetPuzzleTracking() {
    state.puzzleRuntime.cursor = 0;
    state.puzzleRuntime.status = "idle";
    state.puzzleRuntime.message = "";
  }

  function loadPuzzlePosition(indexOverride) {
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
    cancelAiThinking();
    clearSelection();
    clearPendingPromotion();
    setError("");
    state.modeState = modeCore.setGameMode(state.modeState, mode);
    state.ai.lastDecisionText = "";
    syncBoardOrientationForContext();

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

    const result = state.chess.move(moveSpec);
    if (!result) {
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
      state.chess.undo();
      syncLastMoveSquares();
      state.puzzleRuntime.message = `这步不是题解线路。目标尝试：${expected.san}`;
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
          render();
          return;
        }

        const move = state.chess.move({
          from: best.from,
          to: best.to,
          promotion: best.promotion,
        });
        state.ai.thinking = false;

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
    const timing = state.ai.lastThinkMs > 0 ? `，耗时 ${state.ai.lastThinkMs}ms` : "";
    const base = state.ai.thinking ? `AI 正在搜索（深度 ${state.ai.depth}）...` : state.ai.lastDecisionText;
    els.aiMessage.textContent = base || "可切换执子与深度后开始新对局。";
    if (!state.ai.thinking && state.ai.lastDecisionText && timing) {
      els.aiMessage.textContent += timing;
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
    if (!puzzle) {
      els.puzzleGoal.textContent = "当前分类暂无题目。";
      els.puzzleMessage.textContent = "";
      els.puzzleNext.disabled = true;
      return;
    }

    els.puzzleGoal.textContent = `${puzzle.goalLabel}｜${puzzle.title}：${puzzle.intro}`;
    els.puzzleMessage.textContent = state.puzzleRuntime.message || "点击开始。";
    els.puzzleNext.disabled = list.length <= 1;
  }

  function renderLessonPanel() {
    const options = LESSONS.map(function (lesson) {
      return { value: lesson.id, label: lesson.title };
    });
    fillSelect(els.lessonSelect, options, state.lessonState.activeLessonId);

    const lesson = getActiveLesson();
    if (!lesson) {
      els.lessonProgress.textContent = "暂无讲解棋局。";
      els.lessonNote.textContent = "";
      return;
    }

    const step = state.lessonState.stepIndex;
    els.lessonProgress.textContent = `进度：第 ${step}/${lesson.moves.length} 半回合`;
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
