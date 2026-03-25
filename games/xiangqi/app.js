/* global XiangqiCore, XiangqiAI */
(function () {
  const { createGame, getLegalMovesForPiece, makeMove, getPieceText } = XiangqiCore;
  const { chooseMove } = XiangqiAI;

  const boardEl = document.getElementById('board');
  const modeSelect = document.getElementById('mode-select');
  const levelSelect = document.getElementById('level-select');
  const humanSideSelect = document.getElementById('human-side-select');
  const turnTextEl = document.getElementById('turn-text');
  const statusTextEl = document.getElementById('status-text');
  const reasonTextEl = document.getElementById('reason-text');
  const aiTextEl = document.getElementById('ai-text');
  const topSideStatusEl = document.getElementById('top-side-status');
  const bottomSideStatusEl = document.getElementById('bottom-side-status');
  const undoBtn = document.getElementById('undo-btn');
  const restartBtn = document.getElementById('restart-btn');

  let settings = {
    mode: 'pvp',
    level: 'medium',
    humanSide: 'red',
  };

  let game = createGame();
  let snapshots = [game];
  let selected = null;
  let legalTargets = [];
  let thinking = false;
  let aiTimer = null;

  function sideLabel(side) {
    if (side === 'red') return '红方';
    if (side === 'black') return '黑方';
    return '-';
  }

  function statusLabel(currentGame) {
    switch (currentGame.status) {
      case 'playing':
        return '进行中';
      case 'check':
        return '将军';
      case 'checkmate':
        return '将死';
      case 'stalemate':
        return '困毙';
      case 'draw':
        return '和棋';
      case 'forbidden-repeat-loss':
        return '重复禁着判负';
      default:
        return currentGame.status || '-';
    }
  }

  function reasonLabel(currentGame) {
    switch (currentGame.reason) {
      case 'check':
        return '被将军';
      case 'checkmate':
        return '将死';
      case 'stalemate':
        return '困毙';
      case 'long-check':
        return '长将禁着';
      case 'long-chase':
        return '长捉禁着';
      case 'repeat-draw':
        return '重复局面和棋';
      default:
        if (currentGame.winner) {
          return sideLabel(currentGame.winner) + '胜';
        }
        return '-';
    }
  }

  function isGameActive() {
    return game.status === 'playing' || game.status === 'check';
  }

  function aiSide() {
    return settings.humanSide === 'red' ? 'black' : 'red';
  }

  function isHumanTurn() {
    if (!isGameActive() || thinking) return false;
    if (settings.mode === 'pvp') return true;
    return game.sideToMove === settings.humanSide;
  }

  function clearSelection() {
    selected = null;
    legalTargets = [];
  }

  function moveKey(move) {
    return move.to.row + ':' + move.to.col;
  }

  function recomputeSelectionMoves() {
    if (!selected) {
      legalTargets = [];
      return;
    }
    legalTargets = getLegalMovesForPiece(game, selected.row, selected.col);
    if (!legalTargets.length) {
      clearSelection();
    }
  }

  function pushState(nextGame) {
    snapshots.push(nextGame);
    game = nextGame;
  }

  function startNewGame() {
    if (aiTimer) {
      clearTimeout(aiTimer);
      aiTimer = null;
    }
    thinking = false;
    clearSelection();
    game = createGame();
    snapshots = [game];
    render();
    maybeTriggerAiTurn();
  }

  function applyMove(move) {
    const nextGame = makeMove(game, move);
    if (nextGame === game) {
      return false;
    }
    pushState(nextGame);
    clearSelection();
    render();
    maybeTriggerAiTurn();
    return true;
  }

  function handleCellClick(row, col) {
    if (!isHumanTurn()) {
      return;
    }

    const piece = game.board[row][col];
    if (!selected) {
      if (piece && piece.side === game.sideToMove) {
        selected = { row: row, col: col };
        recomputeSelectionMoves();
        renderBoard();
      }
      return;
    }

    if (piece && piece.side === game.sideToMove) {
      selected = { row: row, col: col };
      recomputeSelectionMoves();
      renderBoard();
      return;
    }

    const match = legalTargets.find(function (candidate) {
      return candidate.to.row === row && candidate.to.col === col;
    });
    if (match) {
      applyMove(match);
      return;
    }

    clearSelection();
    renderBoard();
  }

  function levelBudget(level) {
    if (level === 'easy') return 120;
    if (level === 'hard') return 900;
    return 300;
  }

  function maybeTriggerAiTurn() {
    if (settings.mode !== 'pve') return;
    if (!isGameActive()) return;
    if (game.sideToMove !== aiSide()) return;
    if (thinking) return;

    thinking = true;
    renderStatus();
    renderControls();

    aiTimer = setTimeout(function () {
      aiTimer = null;
      let move = null;
      try {
        move = chooseMove(game, {
          level: settings.level,
          timeBudgetMs: levelBudget(settings.level),
        });
      } catch (error) {
        console.error(error);
      }

      thinking = false;
      if (move) {
        applyMove(move);
      } else {
        render();
      }
    }, 30);
  }

  function undoMoves() {
    if (thinking || snapshots.length <= 1) {
      return;
    }

    let steps = 1;
    if (settings.mode === 'pve' && game.sideToMove === settings.humanSide && snapshots.length >= 3) {
      steps = 2;
    }

    while (steps > 0 && snapshots.length > 1) {
      snapshots.pop();
      steps -= 1;
    }

    game = snapshots[snapshots.length - 1];
    clearSelection();
    render();
  }

  function targetMap() {
    const map = new Map();
    for (let i = 0; i < legalTargets.length; i += 1) {
      const move = legalTargets[i];
      map.set(moveKey(move), move);
    }
    return map;
  }

  function renderBoard() {
    const targets = targetMap();
    boardEl.innerHTML = '';

    for (let row = 0; row < game.rows; row += 1) {
      for (let col = 0; col < game.cols; col += 1) {
        const piece = game.board[row][col];
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.setAttribute('role', 'gridcell');
        cell.ariaLabel = '第' + (row + 1) + '行第' + (col + 1) + '列';

        if (!isHumanTurn()) {
          cell.disabled = true;
          cell.classList.add('is-disabled');
        }

        if (selected && selected.row === row && selected.col === col) {
          cell.classList.add('is-selected');
        }

        const targetMove = targets.get(row + ':' + col);
        if (targetMove) {
          cell.classList.add('is-target');
          if (piece && piece.side !== game.sideToMove) {
            cell.classList.add('is-capture');
          }
        }

        if (piece) {
          const pieceEl = document.createElement('span');
          pieceEl.className = 'piece ' + piece.side;
          pieceEl.textContent = getPieceText(piece);
          cell.appendChild(pieceEl);
        }

        cell.addEventListener('click', function () {
          handleCellClick(row, col);
        });

        boardEl.appendChild(cell);
      }
    }
  }

  function renderStatus() {
    turnTextEl.textContent = isGameActive() ? sideLabel(game.sideToMove) : '-';
    statusTextEl.textContent = statusLabel(game);
    reasonTextEl.textContent = reasonLabel(game);

    if (settings.mode === 'pvp') {
      aiTextEl.textContent = '未启用';
    } else if (thinking) {
      aiTextEl.textContent = '思考中…';
    } else {
      aiTextEl.textContent = game.sideToMove === aiSide() && isGameActive() ? '等待落子' : '待机';
    }

    topSideStatusEl.textContent = game.sideToMove === 'black' && isGameActive() ? '行棋中' : '等待';
    bottomSideStatusEl.textContent = game.sideToMove === 'red' && isGameActive() ? '行棋中' : '等待';

    if (game.winner === 'red') {
      bottomSideStatusEl.textContent = '获胜';
      topSideStatusEl.textContent = '落败';
    } else if (game.winner === 'black') {
      topSideStatusEl.textContent = '获胜';
      bottomSideStatusEl.textContent = '落败';
    } else if (game.status === 'draw') {
      topSideStatusEl.textContent = '和棋';
      bottomSideStatusEl.textContent = '和棋';
    }
  }

  function renderControls() {
    const pve = settings.mode === 'pve';
    levelSelect.disabled = !pve;
    humanSideSelect.disabled = !pve;
    undoBtn.disabled = thinking || snapshots.length <= 1;
  }

  function render() {
    renderBoard();
    renderStatus();
    renderControls();
  }

  function updateSettingsFromControls() {
    settings = {
      mode: modeSelect.value,
      level: levelSelect.value,
      humanSide: humanSideSelect.value,
    };
  }

  modeSelect.addEventListener('change', function () {
    updateSettingsFromControls();
    startNewGame();
  });

  levelSelect.addEventListener('change', function () {
    updateSettingsFromControls();
    startNewGame();
  });

  humanSideSelect.addEventListener('change', function () {
    updateSettingsFromControls();
    startNewGame();
  });

  undoBtn.addEventListener('click', function () {
    undoMoves();
  });

  restartBtn.addEventListener('click', function () {
    startNewGame();
  });

  updateSettingsFromControls();
  render();
  maybeTriggerAiTurn();
})();
