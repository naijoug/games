(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(root);
  } else {
    root.ChessAI = factory(root);
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function (root) {
  const PIECE_VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
  };

  const PST = {
    p: [
      0, 0, 0, 0, 0, 0, 0, 0,
      50, 50, 50, 50, 50, 50, 50, 50,
      10, 10, 20, 30, 30, 20, 10, 10,
      5, 5, 10, 25, 25, 10, 5, 5,
      0, 0, 0, 20, 20, 0, 0, 0,
      5, -5, -10, 0, 0, -10, -5, 5,
      5, 10, 10, -20, -20, 10, 10, 5,
      0, 0, 0, 0, 0, 0, 0, 0,
    ],
    n: [
      -50, -40, -30, -30, -30, -30, -40, -50,
      -40, -20, 0, 0, 0, 0, -20, -40,
      -30, 0, 10, 15, 15, 10, 0, -30,
      -30, 5, 15, 20, 20, 15, 5, -30,
      -30, 0, 15, 20, 20, 15, 0, -30,
      -30, 5, 10, 15, 15, 10, 5, -30,
      -40, -20, 0, 5, 5, 0, -20, -40,
      -50, -40, -30, -30, -30, -30, -40, -50,
    ],
    b: [
      -20, -10, -10, -10, -10, -10, -10, -20,
      -10, 0, 0, 0, 0, 0, 0, -10,
      -10, 0, 5, 10, 10, 5, 0, -10,
      -10, 5, 5, 10, 10, 5, 5, -10,
      -10, 0, 10, 10, 10, 10, 0, -10,
      -10, 10, 10, 10, 10, 10, 10, -10,
      -10, 5, 0, 0, 0, 0, 5, -10,
      -20, -10, -10, -10, -10, -10, -10, -20,
    ],
    r: [
      0, 0, 0, 5, 5, 0, 0, 0,
      -5, 0, 0, 0, 0, 0, 0, -5,
      -5, 0, 0, 0, 0, 0, 0, -5,
      -5, 0, 0, 0, 0, 0, 0, -5,
      -5, 0, 0, 0, 0, 0, 0, -5,
      -5, 0, 0, 0, 0, 0, 0, -5,
      5, 10, 10, 10, 10, 10, 10, 5,
      0, 0, 0, 0, 0, 0, 0, 0,
    ],
    q: [
      -20, -10, -10, -5, -5, -10, -10, -20,
      -10, 0, 0, 0, 0, 0, 0, -10,
      -10, 0, 5, 5, 5, 5, 0, -10,
      -5, 0, 5, 5, 5, 5, 0, -5,
      0, 0, 5, 5, 5, 5, 0, -5,
      -10, 5, 5, 5, 5, 5, 0, -10,
      -10, 0, 5, 0, 0, 0, 0, -10,
      -20, -10, -10, -5, -5, -10, -10, -20,
    ],
    k: [
      -30, -40, -40, -50, -50, -40, -40, -30,
      -30, -40, -40, -50, -50, -40, -40, -30,
      -30, -40, -40, -50, -50, -40, -40, -30,
      -30, -40, -40, -50, -50, -40, -40, -30,
      -20, -30, -30, -40, -40, -30, -30, -20,
      -10, -20, -20, -20, -20, -20, -20, -10,
      20, 20, 0, 0, 0, 0, 20, 20,
      20, 30, 10, 0, 0, 10, 30, 20,
    ],
  };

  function callBoolMethod(chess, names) {
    for (const name of names) {
      if (typeof chess[name] === "function") {
        return Boolean(chess[name]());
      }
    }
    return false;
  }

  function isCheckmate(chess) {
    return callBoolMethod(chess, ["isCheckmate", "inCheckmate", "in_checkmate"]);
  }

  function isDraw(chess) {
    return callBoolMethod(chess, ["isDraw", "inDraw", "in_draw"]);
  }

  function isGameOver(chess) {
    return callBoolMethod(chess, ["isGameOver", "game_over"]) || isCheckmate(chess) || isDraw(chess);
  }

  function mirrorIndex(index) {
    const row = Math.floor(index / 8);
    const col = index % 8;
    return (7 - row) * 8 + col;
  }

  function evaluateBoard(chess) {
    const board = chess.board();
    let score = 0;

    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const piece = board[row][col];
        if (!piece) {
          continue;
        }

        const type = piece.type;
        const base = PIECE_VALUES[type] || 0;
        const table = PST[type] || PST.q;
        const index = row * 8 + col;
        const positional = piece.color === "w" ? table[index] : table[mirrorIndex(index)];
        const signed = base + positional;
        score += piece.color === "w" ? signed : -signed;
      }
    }

    return score;
  }

  function evaluateForSide(chess, side) {
    const materialScore = evaluateBoard(chess);
    const signed = side === "w" ? materialScore : -materialScore;

    let mobility = 0;
    try {
      mobility = (chess.moves() || []).length;
    } catch (_) {
      mobility = 0;
    }

    const mobilityBonus = (chess.turn() === side ? 1 : -1) * mobility * 0.5;
    return signed + mobilityBonus;
  }

  function terminalScore(chess, rootSide, depthRemaining) {
    if (isCheckmate(chess)) {
      const sideToMove = typeof chess.turn === "function" ? chess.turn() : "w";
      const rootIsMated = sideToMove === rootSide;
      return rootIsMated ? -100000 - depthRemaining : 100000 + depthRemaining;
    }
    if (isDraw(chess)) {
      return 0;
    }
    return evaluateForSide(chess, rootSide);
  }

  function movePriority(move) {
    let score = 0;
    if (move.captured) {
      score += (PIECE_VALUES[move.captured] || 0) + 1000;
    }
    if (move.promotion) {
      score += (PIECE_VALUES[move.promotion] || 900) + 800;
    }
    if (typeof move.san === "string") {
      if (move.san.includes("#")) {
        score += 10000;
      } else if (move.san.includes("+")) {
        score += 300;
      }
      if (move.san.startsWith("O-O")) {
        score += 40;
      }
    }
    if (move.flags && String(move.flags).includes("k")) {
      score += 50;
    }
    return score;
  }

  function orderMoves(moves) {
    return moves.slice().sort((a, b) => movePriority(b) - movePriority(a));
  }

  function search(chess, depth, alpha, beta, rootSide) {
    if (depth <= 0 || isGameOver(chess)) {
      return terminalScore(chess, rootSide, depth);
    }

    const currentTurn = typeof chess.turn === "function" ? chess.turn() : "w";
    const maximizing = currentTurn === rootSide;
    const legalMoves = orderMoves(chess.moves({ verbose: true }) || []);

    if (legalMoves.length === 0) {
      return terminalScore(chess, rootSide, depth);
    }

    if (maximizing) {
      let best = -Infinity;
      for (const move of legalMoves) {
        chess.move(move);
        const score = search(chess, depth - 1, alpha, beta, rootSide);
        chess.undo();
        if (score > best) {
          best = score;
        }
        if (score > alpha) {
          alpha = score;
        }
        if (beta <= alpha) {
          break;
        }
      }
      return best;
    }

    let best = Infinity;
    for (const move of legalMoves) {
      chess.move(move);
      const score = search(chess, depth - 1, alpha, beta, rootSide);
      chess.undo();
      if (score < best) {
        best = score;
      }
      if (score < beta) {
        beta = score;
      }
      if (beta <= alpha) {
        break;
      }
    }
    return best;
  }

  function findBestMove(chess, options) {
    const depth = Math.max(1, Math.min(Number(options && options.depth) || 3, 4));
    const side = options && options.side ? options.side : chess.turn();
    const legalMoves = orderMoves(chess.moves({ verbose: true }) || []);

    if (legalMoves.length === 0) {
      return null;
    }

    let bestMove = legalMoves[0];
    let bestScore = -Infinity;
    const maximizingTurn = typeof chess.turn === "function" ? chess.turn() : "w";

    if (maximizingTurn !== side) {
      return legalMoves[0];
    }

    for (const move of legalMoves) {
      chess.move(move);
      const score = search(chess, depth - 1, -Infinity, Infinity, side);
      chess.undo();
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return {
      ...bestMove,
      score: bestScore,
      searchedDepth: depth,
    };
  }

  return {
    PIECE_VALUES,
    evaluateBoard,
    evaluateForSide,
    findBestMove,
  };
});
