(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./game-core.js'));
  } else {
    root.XiangqiAI = factory(root.XiangqiCore);
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function (XiangqiCore) {
  const { getLegalMoves, makeMove, oppositeSide } = XiangqiCore;

  const PIECE_VALUES = {
    king: 100000,
    rook: 900,
    cannon: 450,
    horse: 400,
    elephant: 220,
    advisor: 220,
    pawn: 100,
  };

  function nowMs() {
    return Date.now();
  }

  function sideSign(side) {
    return side === 'red' ? 1 : -1;
  }

  function pieceSquareBonus(piece, row, col) {
    let bonus = 0;
    if (piece.type === 'pawn') {
      if (piece.side === 'red') {
        bonus += (9 - row) * 6;
        if (row <= 4) bonus += 35;
      } else {
        bonus += row * 6;
        if (row >= 5) bonus += 35;
      }
      bonus += (4 - Math.abs(4 - col)) * 3;
    }
    if (piece.type === 'king') {
      bonus -= Math.abs(4 - col) * 3;
    }
    if (piece.type === 'rook' || piece.type === 'cannon' || piece.type === 'horse') {
      bonus += (4 - Math.abs(4 - col)) * 2;
    }
    return bonus;
  }

  function evaluateMaterialAndPosition(game) {
    let score = 0;
    for (let r = 0; r < game.rows; r += 1) {
      for (let c = 0; c < game.cols; c += 1) {
        const piece = game.board[r][c];
        if (!piece) continue;
        const base = PIECE_VALUES[piece.type] || 0;
        const positional = pieceSquareBonus(piece, r, c);
        score += sideSign(piece.side) * (base + positional);
      }
    }
    return score;
  }

  function evaluate(game, perspectiveSide) {
    if (game.status === 'checkmate' || game.status === 'stalemate' || game.status === 'forbidden-repeat-loss') {
      if (game.winner === perspectiveSide) return 10000000 - game.moveNumber;
      if (game.winner && game.winner !== perspectiveSide) return -10000000 + game.moveNumber;
    }
    if (game.status === 'draw') {
      return 0;
    }

    let score = evaluateMaterialAndPosition(game);
    if (game.status === 'check') {
      score += game.sideToMove === 'red' ? -40 : 40;
    }

    return perspectiveSide === 'red' ? score : -score;
  }

  function moveHeuristic(move) {
    let score = 0;
    if (move.capturedPieceType) {
      score += (PIECE_VALUES[move.capturedPieceType] || 0) * 10;
      score -= (PIECE_VALUES[move.pieceType] || 0);
    }
    if (move.pieceType === 'pawn') {
      score += 2;
    }
    if (move.pieceType === 'cannon' || move.pieceType === 'rook') {
      score += 1;
    }
    return score;
  }

  function sortMoves(moves) {
    return moves.slice().sort(function (a, b) {
      return moveHeuristic(b) - moveHeuristic(a);
    });
  }

  function timeExceeded(deadline) {
    return nowMs() >= deadline;
  }

  function createTimeoutError() {
    const err = new Error('AI_TIME_BUDGET_EXCEEDED');
    err.code = 'AI_TIME_BUDGET_EXCEEDED';
    return err;
  }

  function alphaBeta(game, depth, alpha, beta, perspectiveSide, deadline) {
    if (timeExceeded(deadline)) {
      throw createTimeoutError();
    }

    if (depth <= 0 || (game.status !== 'playing' && game.status !== 'check')) {
      return { score: evaluate(game, perspectiveSide), move: null };
    }

    const legalMoves = getLegalMoves(game);
    if (!legalMoves.length) {
      return { score: evaluate(game, perspectiveSide), move: null };
    }

    const maximizing = game.sideToMove === perspectiveSide;
    let bestMove = legalMoves[0];

    if (maximizing) {
      let bestScore = -Infinity;
      const ordered = sortMoves(legalMoves);
      for (let i = 0; i < ordered.length; i += 1) {
        const move = ordered[i];
        const next = makeMove(game, move);
        if (next === game) continue;
        const result = alphaBeta(next, depth - 1, alpha, beta, perspectiveSide, deadline);
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        if (bestScore > alpha) alpha = bestScore;
        if (beta <= alpha) break;
      }
      return { score: bestScore, move: bestMove };
    }

    let bestScore = Infinity;
    const ordered = sortMoves(legalMoves);
    for (let i = 0; i < ordered.length; i += 1) {
      const move = ordered[i];
      const next = makeMove(game, move);
      if (next === game) continue;
      const result = alphaBeta(next, depth - 1, alpha, beta, perspectiveSide, deadline);
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      if (bestScore < beta) beta = bestScore;
      if (beta <= alpha) break;
    }
    return { score: bestScore, move: bestMove };
  }

  function pickRandomTopMoves(candidates, topN) {
    if (!candidates.length) return null;
    const sorted = candidates.slice().sort(function (a, b) {
      return b.score - a.score;
    });
    const limit = Math.min(topN, sorted.length);
    const choice = Math.floor(Math.random() * limit);
    return sorted[choice].move;
  }

  function chooseEasy(game, budgetMs) {
    const legalMoves = getLegalMoves(game);
    if (!legalMoves.length) return null;
    const deadline = nowMs() + Math.max(20, budgetMs || 60);
    const scored = [];
    for (let i = 0; i < legalMoves.length; i += 1) {
      if (timeExceeded(deadline)) break;
      const move = legalMoves[i];
      const next = makeMove(game, move);
      const score = evaluate(next, game.sideToMove) + Math.floor(Math.random() * 20) - 10;
      scored.push({ move: move, score: score });
    }
    return pickRandomTopMoves(scored.length ? scored : legalMoves.map(function (m) { return { move: m, score: 0 }; }), 3);
  }

  function chooseFixedDepth(game, depth, budgetMs) {
    const legalMoves = getLegalMoves(game);
    if (!legalMoves.length) return null;
    const deadline = nowMs() + Math.max(20, budgetMs || 120);
    try {
      return alphaBeta(game, depth, -Infinity, Infinity, game.sideToMove, deadline).move || legalMoves[0];
    } catch (err) {
      if (err && err.code === 'AI_TIME_BUDGET_EXCEEDED') {
        return legalMoves[0];
      }
      throw err;
    }
  }

  function chooseHard(game, budgetMs) {
    const legalMoves = getLegalMoves(game);
    if (!legalMoves.length) return null;
    const budget = Math.max(40, budgetMs || 500);
    const deadline = nowMs() + budget;
    let bestMove = legalMoves[0];
    let depth = 1;
    while (depth <= 4) {
      try {
        const result = alphaBeta(game, depth, -Infinity, Infinity, game.sideToMove, deadline);
        if (result.move) {
          bestMove = result.move;
        }
        depth += 1;
      } catch (err) {
        if (err && err.code === 'AI_TIME_BUDGET_EXCEEDED') {
          break;
        }
        throw err;
      }
      if (timeExceeded(deadline)) break;
    }
    return bestMove;
  }

  function chooseMove(game, options) {
    if (!game || (game.status !== 'playing' && game.status !== 'check')) {
      return null;
    }

    const opts = options || {};
    const level = opts.level || 'medium';
    const timeBudgetMs = Number.isFinite(opts.timeBudgetMs) ? opts.timeBudgetMs : undefined;

    if (level === 'easy') {
      return chooseEasy(game, timeBudgetMs);
    }
    if (level === 'hard') {
      return chooseHard(game, timeBudgetMs);
    }
    return chooseFixedDepth(game, 2, timeBudgetMs);
  }

  return {
    chooseMove: chooseMove,
    evaluate: evaluate,
    oppositeSide: oppositeSide,
  };
});
