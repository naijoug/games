(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.XiangqiCore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  const ROWS = 10;
  const COLS = 9;
  const SIDES = ['red', 'black'];
  const PIECE_TYPES = ['king', 'advisor', 'elephant', 'horse', 'rook', 'cannon', 'pawn'];

  const PIECE_CHARS = {
    red: {
      king: '帅',
      advisor: '仕',
      elephant: '相',
      horse: '马',
      rook: '车',
      cannon: '炮',
      pawn: '兵',
    },
    black: {
      king: '将',
      advisor: '士',
      elephant: '象',
      horse: '马',
      rook: '车',
      cannon: '炮',
      pawn: '卒',
    },
  };

  let autoIdCounter = 1;

  function oppositeSide(side) {
    return side === 'red' ? 'black' : 'red';
  }

  function inBounds(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
  }

  function createEmptyBoard() {
    return Array.from({ length: ROWS }, function () {
      return Array(COLS).fill(null);
    });
  }

  function cloneBoard(board) {
    return board.map(function (row) {
      return row.slice();
    });
  }

  function cloneHistory(history) {
    return history.map(function (entry) {
      return {
        from: { row: entry.from.row, col: entry.from.col },
        to: { row: entry.to.row, col: entry.to.col },
        pieceId: entry.pieceId,
        pieceType: entry.pieceType,
        side: entry.side,
        capturedPieceId: entry.capturedPieceId || null,
        capturedPieceType: entry.capturedPieceType || null,
        givesCheck: Boolean(entry.givesCheck),
        chaseTargets: (entry.chaseTargets || []).slice(),
        positionKeyAfter: entry.positionKeyAfter || null,
      };
    });
  }

  function createPiece(side, type, id) {
    if (SIDES.indexOf(side) === -1) {
      throw new Error('Invalid side: ' + side);
    }
    if (PIECE_TYPES.indexOf(type) === -1) {
      throw new Error('Invalid piece type: ' + type);
    }
    return {
      id: id || side.charAt(0) + '-' + type + '-' + autoIdCounter++,
      side: side,
      type: type,
    };
  }

  function palaceContains(side, row, col) {
    if (col < 3 || col > 5) {
      return false;
    }
    if (side === 'red') {
      return row >= 7 && row <= 9;
    }
    return row >= 0 && row <= 2;
  }

  function elephantOwnSide(side, row) {
    return side === 'red' ? row >= 5 : row <= 4;
  }

  function hasCrossedRiver(side, row) {
    return side === 'red' ? row <= 4 : row >= 5;
  }

  function buildInitialBoard() {
    const board = createEmptyBoard();
    const placements = [
      [0, 0, 'black', 'rook', 'b-rook-1'],
      [0, 1, 'black', 'horse', 'b-horse-1'],
      [0, 2, 'black', 'elephant', 'b-elephant-1'],
      [0, 3, 'black', 'advisor', 'b-advisor-1'],
      [0, 4, 'black', 'king', 'b-king-1'],
      [0, 5, 'black', 'advisor', 'b-advisor-2'],
      [0, 6, 'black', 'elephant', 'b-elephant-2'],
      [0, 7, 'black', 'horse', 'b-horse-2'],
      [0, 8, 'black', 'rook', 'b-rook-2'],
      [2, 1, 'black', 'cannon', 'b-cannon-1'],
      [2, 7, 'black', 'cannon', 'b-cannon-2'],
      [3, 0, 'black', 'pawn', 'b-pawn-1'],
      [3, 2, 'black', 'pawn', 'b-pawn-2'],
      [3, 4, 'black', 'pawn', 'b-pawn-3'],
      [3, 6, 'black', 'pawn', 'b-pawn-4'],
      [3, 8, 'black', 'pawn', 'b-pawn-5'],

      [9, 0, 'red', 'rook', 'r-rook-1'],
      [9, 1, 'red', 'horse', 'r-horse-1'],
      [9, 2, 'red', 'elephant', 'r-elephant-1'],
      [9, 3, 'red', 'advisor', 'r-advisor-1'],
      [9, 4, 'red', 'king', 'r-king-1'],
      [9, 5, 'red', 'advisor', 'r-advisor-2'],
      [9, 6, 'red', 'elephant', 'r-elephant-2'],
      [9, 7, 'red', 'horse', 'r-horse-2'],
      [9, 8, 'red', 'rook', 'r-rook-2'],
      [7, 1, 'red', 'cannon', 'r-cannon-1'],
      [7, 7, 'red', 'cannon', 'r-cannon-2'],
      [6, 0, 'red', 'pawn', 'r-pawn-1'],
      [6, 2, 'red', 'pawn', 'r-pawn-2'],
      [6, 4, 'red', 'pawn', 'r-pawn-3'],
      [6, 6, 'red', 'pawn', 'r-pawn-4'],
      [6, 8, 'red', 'pawn', 'r-pawn-5'],
    ];

    for (let i = 0; i < placements.length; i += 1) {
      const item = placements[i];
      board[item[0]][item[1]] = createPiece(item[2], item[3], item[4]);
    }
    return board;
  }

  function boardToPositionKey(board, sideToMove) {
    const rows = [];
    for (let r = 0; r < ROWS; r += 1) {
      let line = '';
      let empty = 0;
      for (let c = 0; c < COLS; c += 1) {
        const piece = board[r][c];
        if (!piece) {
          empty += 1;
          continue;
        }
        if (empty > 0) {
          line += String(empty);
          empty = 0;
        }
        line += piece.side.charAt(0) + piece.type.charAt(0) + ':' + piece.id;
      }
      if (empty > 0) {
        line += String(empty);
      }
      rows.push(line || '9');
    }
    return rows.join('/') + '|' + sideToMove;
  }

  function findKing(board, side) {
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const piece = board[r][c];
        if (piece && piece.side === side && piece.type === 'king') {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  function countBetweenOnFile(board, col, rowA, rowB) {
    const start = Math.min(rowA, rowB) + 1;
    const end = Math.max(rowA, rowB);
    let count = 0;
    for (let r = start; r < end; r += 1) {
      if (board[r][col]) {
        count += 1;
      }
    }
    return count;
  }

  function kingsFacing(board) {
    const redKing = findKing(board, 'red');
    const blackKing = findKing(board, 'black');
    if (!redKing || !blackKing) {
      return false;
    }
    if (redKing.col !== blackKing.col) {
      return false;
    }
    return countBetweenOnFile(board, redKing.col, redKing.row, blackKing.row) === 0;
  }

  function pieceAttacksSquare(board, fromRow, fromCol, piece, targetRow, targetCol) {
    const dr = targetRow - fromRow;
    const dc = targetCol - fromCol;

    if (piece.type === 'king') {
      if (Math.abs(dr) + Math.abs(dc) === 1 && palaceContains(piece.side, targetRow, targetCol)) {
        return true;
      }
      const enemyKing = board[targetRow] && board[targetRow][targetCol];
      if (
        enemyKing &&
        enemyKing.type === 'king' &&
        enemyKing.side !== piece.side &&
        fromCol === targetCol &&
        countBetweenOnFile(board, fromCol, fromRow, targetRow) === 0
      ) {
        return true;
      }
      return false;
    }

    if (piece.type === 'advisor') {
      return (
        Math.abs(dr) === 1 &&
        Math.abs(dc) === 1 &&
        palaceContains(piece.side, targetRow, targetCol)
      );
    }

    if (piece.type === 'elephant') {
      if (Math.abs(dr) !== 2 || Math.abs(dc) !== 2) {
        return false;
      }
      if (!elephantOwnSide(piece.side, targetRow)) {
        return false;
      }
      const eyeRow = fromRow + dr / 2;
      const eyeCol = fromCol + dc / 2;
      return board[eyeRow][eyeCol] === null;
    }

    if (piece.type === 'horse') {
      const adr = Math.abs(dr);
      const adc = Math.abs(dc);
      if (!((adr === 1 && adc === 2) || (adr === 2 && adc === 1))) {
        return false;
      }
      let legRow = fromRow;
      let legCol = fromCol;
      if (adr === 1) {
        legCol = fromCol + dc / 2;
      } else {
        legRow = fromRow + dr / 2;
      }
      return board[legRow][legCol] === null;
    }

    if (piece.type === 'rook') {
      if (dr !== 0 && dc !== 0) {
        return false;
      }
      if (dr === 0) {
        const start = Math.min(fromCol, targetCol) + 1;
        const end = Math.max(fromCol, targetCol);
        for (let c = start; c < end; c += 1) {
          if (board[fromRow][c]) {
            return false;
          }
        }
        return true;
      }
      const start = Math.min(fromRow, targetRow) + 1;
      const end = Math.max(fromRow, targetRow);
      for (let r = start; r < end; r += 1) {
        if (board[r][fromCol]) {
          return false;
        }
      }
      return true;
    }

    if (piece.type === 'cannon') {
      if (dr !== 0 && dc !== 0) {
        return false;
      }
      let screens = 0;
      if (dr === 0) {
        const start = Math.min(fromCol, targetCol) + 1;
        const end = Math.max(fromCol, targetCol);
        for (let c = start; c < end; c += 1) {
          if (board[fromRow][c]) {
            screens += 1;
          }
        }
      } else {
        const start = Math.min(fromRow, targetRow) + 1;
        const end = Math.max(fromRow, targetRow);
        for (let r = start; r < end; r += 1) {
          if (board[r][fromCol]) {
            screens += 1;
          }
        }
      }
      const targetPiece = board[targetRow][targetCol];
      if (targetPiece) {
        return screens === 1;
      }
      return screens === 0;
    }

    if (piece.type === 'pawn') {
      const forward = piece.side === 'red' ? -1 : 1;
      if (dr === forward && dc === 0) {
        return true;
      }
      if (hasCrossedRiver(piece.side, fromRow) && dr === 0 && Math.abs(dc) === 1) {
        return true;
      }
      return false;
    }

    return false;
  }

  function isInCheck(board, side) {
    const kingPos = findKing(board, side);
    if (!kingPos) {
      return true;
    }

    if (kingsFacing(board)) {
      return true;
    }

    const enemy = oppositeSide(side);
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const piece = board[r][c];
        if (!piece || piece.side !== enemy) {
          continue;
        }
        if (pieceAttacksSquare(board, r, c, piece, kingPos.row, kingPos.col)) {
          return true;
        }
      }
    }

    return false;
  }

  function pushIfValidPseudoMove(moves, board, piece, fromRow, fromCol, toRow, toCol) {
    if (!inBounds(toRow, toCol)) {
      return;
    }
    const target = board[toRow][toCol];
    if (target && target.side === piece.side) {
      return;
    }
    moves.push({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      pieceId: piece.id,
      pieceType: piece.type,
      side: piece.side,
      capturedPieceId: target ? target.id : null,
      capturedPieceType: target ? target.type : null,
    });
  }

  function generatePseudoMovesForPiece(board, row, col) {
    const piece = board[row][col];
    if (!piece) {
      return [];
    }
    const moves = [];

    if (piece.type === 'king') {
      const kingSteps = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (let i = 0; i < kingSteps.length; i += 1) {
        const step = kingSteps[i];
        const toRow = row + step[0];
        const toCol = col + step[1];
        if (palaceContains(piece.side, toRow, toCol)) {
          pushIfValidPseudoMove(moves, board, piece, row, col, toRow, toCol);
        }
      }
      const enemyKing = findKing(board, oppositeSide(piece.side));
      if (
        enemyKing &&
        enemyKing.col === col &&
        countBetweenOnFile(board, col, row, enemyKing.row) === 0
      ) {
        pushIfValidPseudoMove(moves, board, piece, row, col, enemyKing.row, enemyKing.col);
      }
      return moves;
    }

    if (piece.type === 'advisor') {
      const deltas = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (let i = 0; i < deltas.length; i += 1) {
        const toRow = row + deltas[i][0];
        const toCol = col + deltas[i][1];
        if (palaceContains(piece.side, toRow, toCol)) {
          pushIfValidPseudoMove(moves, board, piece, row, col, toRow, toCol);
        }
      }
      return moves;
    }

    if (piece.type === 'elephant') {
      const deltas = [
        [2, 2],
        [2, -2],
        [-2, 2],
        [-2, -2],
      ];
      for (let i = 0; i < deltas.length; i += 1) {
        const dr = deltas[i][0];
        const dc = deltas[i][1];
        const toRow = row + dr;
        const toCol = col + dc;
        if (!inBounds(toRow, toCol) || !elephantOwnSide(piece.side, toRow)) {
          continue;
        }
        const eyeRow = row + dr / 2;
        const eyeCol = col + dc / 2;
        if (board[eyeRow][eyeCol]) {
          continue;
        }
        pushIfValidPseudoMove(moves, board, piece, row, col, toRow, toCol);
      }
      return moves;
    }

    if (piece.type === 'horse') {
      const jumps = [
        { dr: -2, dc: -1, legDr: -1, legDc: 0 },
        { dr: -2, dc: 1, legDr: -1, legDc: 0 },
        { dr: 2, dc: -1, legDr: 1, legDc: 0 },
        { dr: 2, dc: 1, legDr: 1, legDc: 0 },
        { dr: -1, dc: -2, legDr: 0, legDc: -1 },
        { dr: 1, dc: -2, legDr: 0, legDc: -1 },
        { dr: -1, dc: 2, legDr: 0, legDc: 1 },
        { dr: 1, dc: 2, legDr: 0, legDc: 1 },
      ];
      for (let i = 0; i < jumps.length; i += 1) {
        const jump = jumps[i];
        const legRow = row + jump.legDr;
        const legCol = col + jump.legDc;
        if (!inBounds(legRow, legCol) || board[legRow][legCol]) {
          continue;
        }
        pushIfValidPseudoMove(moves, board, piece, row, col, row + jump.dr, col + jump.dc);
      }
      return moves;
    }

    if (piece.type === 'rook' || piece.type === 'cannon') {
      const rays = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (let i = 0; i < rays.length; i += 1) {
        const ray = rays[i];
        let r = row + ray[0];
        let c = col + ray[1];
        let seenScreen = false;
        while (inBounds(r, c)) {
          const target = board[r][c];
          if (piece.type === 'rook') {
            if (!target) {
              pushIfValidPseudoMove(moves, board, piece, row, col, r, c);
            } else {
              if (target.side !== piece.side) {
                pushIfValidPseudoMove(moves, board, piece, row, col, r, c);
              }
              break;
            }
          } else {
            if (!seenScreen) {
              if (!target) {
                pushIfValidPseudoMove(moves, board, piece, row, col, r, c);
              } else {
                seenScreen = true;
              }
            } else if (target) {
              if (target.side !== piece.side) {
                pushIfValidPseudoMove(moves, board, piece, row, col, r, c);
              }
              break;
            }
          }
          r += ray[0];
          c += ray[1];
        }
      }
      return moves;
    }

    if (piece.type === 'pawn') {
      const forward = piece.side === 'red' ? -1 : 1;
      pushIfValidPseudoMove(moves, board, piece, row, col, row + forward, col);
      if (hasCrossedRiver(piece.side, row)) {
        pushIfValidPseudoMove(moves, board, piece, row, col, row, col - 1);
        pushIfValidPseudoMove(moves, board, piece, row, col, row, col + 1);
      }
      return moves;
    }

    return moves;
  }

  function applyMoveToBoard(board, move) {
    const nextBoard = cloneBoard(board);
    const piece = nextBoard[move.from.row][move.from.col];
    nextBoard[move.from.row][move.from.col] = null;
    nextBoard[move.to.row][move.to.col] = piece;
    return nextBoard;
  }

  function attackedTargetsByMovedPiece(board, move) {
    const piece = board[move.to.row][move.to.col];
    if (!piece) {
      return [];
    }
    const targets = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const target = board[r][c];
        if (!target || target.side === piece.side || target.type === 'king') {
          continue;
        }
        if (pieceAttacksSquare(board, move.to.row, move.to.col, piece, r, c)) {
          targets.push(target.id);
        }
      }
    }
    targets.sort();
    return targets;
  }

  function isMoveLegal(board, move, side) {
    const nextBoard = applyMoveToBoard(board, move);
    if (kingsFacing(nextBoard)) {
      return false;
    }
    return !isInCheck(nextBoard, side);
  }

  function getLegalMovesFromBoard(board, side) {
    const legal = [];
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const piece = board[r][c];
        if (!piece || piece.side !== side) {
          continue;
        }
        const pseudo = generatePseudoMovesForPiece(board, r, c);
        for (let i = 0; i < pseudo.length; i += 1) {
          if (isMoveLegal(board, pseudo[i], side)) {
            legal.push(pseudo[i]);
          }
        }
      }
    }
    return legal;
  }

  function getLegalMoves(game, side) {
    const currentSide = side || game.sideToMove;
    return getLegalMovesFromBoard(game.board, currentSide);
  }

  function getLegalMovesForPiece(game, row, col) {
    if (!inBounds(row, col)) {
      return [];
    }
    const piece = game.board[row][col];
    if (!piece || piece.side !== game.sideToMove) {
      return [];
    }
    const pseudo = generatePseudoMovesForPiece(game.board, row, col);
    return pseudo.filter(function (move) {
      return isMoveLegal(game.board, move, piece.side);
    });
  }

  function summarizeStatus(board, sideToMove, lastMover, history, positionKeys) {
    const inCheck = isInCheck(board, sideToMove);
    const legalMoves = getLegalMovesFromBoard(board, sideToMove);

    if (legalMoves.length === 0) {
      return {
        status: inCheck ? 'checkmate' : 'stalemate',
        winner: lastMover || oppositeSide(sideToMove),
        reason: inCheck ? 'checkmate' : 'stalemate',
        inCheck: inCheck,
      };
    }

    const repetition = analyzeRepetition({
      currentPositionKey: positionKeys[positionKeys.length - 1],
      positionKeys: positionKeys,
      recentMoves: history,
      moverSide: lastMover || null,
    });

    if (repetition.type === 'forbidden-repeat-loss') {
      return {
        status: 'forbidden-repeat-loss',
        winner: repetition.winner,
        loser: repetition.loser,
        reason: repetition.reason,
        inCheck: inCheck,
      };
    }

    if (repetition.type === 'draw') {
      return {
        status: 'draw',
        winner: null,
        reason: repetition.reason || 'repeat-draw',
        inCheck: inCheck,
      };
    }

    return {
      status: inCheck ? 'check' : 'playing',
      winner: null,
      reason: inCheck ? 'check' : null,
      inCheck: inCheck,
    };
  }

  function createGame(options) {
    const opts = options || {};
    const board = opts.board ? cloneBoard(opts.board) : buildInitialBoard();
    const sideToMove = opts.sideToMove || 'red';
    const history = opts.history ? cloneHistory(opts.history) : [];
    const positionKeys = opts.positionKeys
      ? opts.positionKeys.slice()
      : [boardToPositionKey(board, sideToMove)];

    const summary = summarizeStatus(
      board,
      sideToMove,
      opts.lastMover || null,
      history,
      positionKeys,
    );

    return {
      rows: ROWS,
      cols: COLS,
      board: board,
      sideToMove: sideToMove,
      status: summary.status,
      winner: summary.winner || null,
      reason: summary.reason || null,
      inCheck: summary.inCheck,
      history: history,
      positionKeys: positionKeys,
      moveNumber: history.length,
      lastMover: opts.lastMover || null,
    };
  }

  function normalizeMoveInput(move) {
    if (!move || !move.from || !move.to) {
      return null;
    }
    const from = move.from;
    const to = move.to;
    if (
      !Number.isInteger(from.row) ||
      !Number.isInteger(from.col) ||
      !Number.isInteger(to.row) ||
      !Number.isInteger(to.col)
    ) {
      return null;
    }
    return {
      from: { row: from.row, col: from.col },
      to: { row: to.row, col: to.col },
    };
  }

  function findMatchingLegalMove(legalMoves, requested) {
    for (let i = 0; i < legalMoves.length; i += 1) {
      const move = legalMoves[i];
      if (
        move.from.row === requested.from.row &&
        move.from.col === requested.from.col &&
        move.to.row === requested.to.row &&
        move.to.col === requested.to.col
      ) {
        return move;
      }
    }
    return null;
  }

  function makeMove(game, moveInput) {
    if (!game || (game.status !== 'playing' && game.status !== 'check')) {
      return game;
    }

    const requested = normalizeMoveInput(moveInput);
    if (!requested) {
      return game;
    }

    const legalMoves = getLegalMoves(game);
    const move = findMatchingLegalMove(legalMoves, requested);
    if (!move) {
      return game;
    }

    const nextBoard = applyMoveToBoard(game.board, move);
    const nextSide = oppositeSide(game.sideToMove);
    const nextKey = boardToPositionKey(nextBoard, nextSide);
    const givesCheck = isInCheck(nextBoard, nextSide);
    const chaseTargets = attackedTargetsByMovedPiece(nextBoard, move);
    const historyEntry = {
      from: { row: move.from.row, col: move.from.col },
      to: { row: move.to.row, col: move.to.col },
      pieceId: move.pieceId,
      pieceType: move.pieceType,
      side: move.side,
      capturedPieceId: move.capturedPieceId || null,
      capturedPieceType: move.capturedPieceType || null,
      givesCheck: givesCheck,
      chaseTargets: chaseTargets,
      positionKeyAfter: nextKey,
    };

    const nextHistory = game.history.concat(historyEntry);
    const nextPositionKeys = game.positionKeys.concat(nextKey);
    const summary = summarizeStatus(
      nextBoard,
      nextSide,
      game.sideToMove,
      nextHistory,
      nextPositionKeys,
    );

    return {
      rows: ROWS,
      cols: COLS,
      board: nextBoard,
      sideToMove: nextSide,
      status: summary.status,
      winner: summary.winner || null,
      reason: summary.reason || null,
      inCheck: summary.inCheck,
      history: nextHistory,
      positionKeys: nextPositionKeys,
      moveNumber: nextHistory.length,
      lastMover: game.sideToMove,
    };
  }

  function intersectionOfTargetSets(movesForSide) {
    let intersection = null;
    for (let i = 0; i < movesForSide.length; i += 1) {
      const targets = movesForSide[i].chaseTargets || [];
      if (!targets.length) {
        return [];
      }
      if (intersection === null) {
        intersection = targets.slice();
      } else {
        intersection = intersection.filter(function (id) {
          return targets.indexOf(id) !== -1;
        });
      }
      if (!intersection.length) {
        return [];
      }
    }
    return intersection || [];
  }

  function analyzeRepetition(payload) {
    if (!payload || !Array.isArray(payload.positionKeys) || !payload.currentPositionKey) {
      return { type: 'none' };
    }

    const positionKeys = payload.positionKeys;
    const currentKey = payload.currentPositionKey;
    const occurrences = [];
    for (let i = 0; i < positionKeys.length; i += 1) {
      if (positionKeys[i] === currentKey) {
        occurrences.push(i);
      }
    }

    if (occurrences.length < 3) {
      return { type: 'none' };
    }

    const lastStateIndex = occurrences[occurrences.length - 1];
    const prevStateIndex = occurrences[occurrences.length - 2];
    const anchorStateIndex = occurrences[occurrences.length - 3];
    const cycleLength = lastStateIndex - prevStateIndex;
    if (cycleLength <= 0) {
      return { type: 'none' };
    }

    const recentMoves = Array.isArray(payload.recentMoves) ? payload.recentMoves : [];
    const cycleMoves = recentMoves.slice(anchorStateIndex, lastStateIndex);
    if (!cycleMoves.length) {
      return { type: 'none' };
    }

    const sides = { red: [], black: [] };
    for (let i = 0; i < cycleMoves.length; i += 1) {
      const move = cycleMoves[i];
      if (move && (move.side === 'red' || move.side === 'black')) {
        sides[move.side].push(move);
      }
    }

    const longCheck = {
      red: sides.red.length >= 2 && sides.red.every(function (m) {
        return Boolean(m.givesCheck);
      }),
      black: sides.black.length >= 2 && sides.black.every(function (m) {
        return Boolean(m.givesCheck);
      }),
    };

    const longChase = {
      red: false,
      black: false,
    };

    for (let i = 0; i < SIDES.length; i += 1) {
      const side = SIDES[i];
      const sideMoves = sides[side];
      if (sideMoves.length < 2) {
        continue;
      }
      if (longCheck[side]) {
        continue;
      }
      const sharedTargets = intersectionOfTargetSets(sideMoves);
      if (sharedTargets.length > 0) {
        longChase[side] = true;
      }
    }

    const moverSide = payload.moverSide;
    const otherSide = moverSide ? oppositeSide(moverSide) : null;

    if (moverSide && longCheck[moverSide]) {
      if (otherSide && longCheck[otherSide]) {
        return { type: 'draw', reason: 'repeat-draw' };
      }
      return {
        type: 'forbidden-repeat-loss',
        loser: moverSide,
        winner: otherSide,
        reason: 'long-check',
      };
    }

    if (moverSide && longChase[moverSide]) {
      if ((otherSide && longCheck[otherSide]) || (otherSide && longChase[otherSide])) {
        return { type: 'draw', reason: 'repeat-draw' };
      }
      return {
        type: 'forbidden-repeat-loss',
        loser: moverSide,
        winner: otherSide,
        reason: 'long-chase',
      };
    }

    if (longCheck.red || longCheck.black || longChase.red || longChase.black) {
      return { type: 'draw', reason: 'repeat-draw' };
    }

    return { type: 'draw', reason: 'repeat-draw' };
  }

  function moveToString(move) {
    if (!move) {
      return '';
    }
    return (
      move.from.row +
      ',' +
      move.from.col +
      '>' +
      move.to.row +
      ',' +
      move.to.col
    );
  }

  function getPieceText(piece) {
    if (!piece) {
      return '';
    }
    return PIECE_CHARS[piece.side][piece.type];
  }

  return {
    ROWS: ROWS,
    COLS: COLS,
    createGame: createGame,
    createEmptyBoard: createEmptyBoard,
    createPiece: createPiece,
    getLegalMoves: getLegalMoves,
    getLegalMovesForPiece: getLegalMovesForPiece,
    makeMove: makeMove,
    isInCheck: isInCheck,
    kingsFacing: kingsFacing,
    boardToPositionKey: boardToPositionKey,
    analyzeRepetition: analyzeRepetition,
    moveToString: moveToString,
    getPieceText: getPieceText,
    oppositeSide: oppositeSide,
  };
});
