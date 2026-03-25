(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(root);
  } else {
    root.ChessGameCore = factory(root);
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function (root) {
  const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const UNICODE_PIECES = {
    wp: "♙",
    wn: "♘",
    wb: "♗",
    wr: "♖",
    wq: "♕",
    wk: "♔",
    bp: "♟",
    bn: "♞",
    bb: "♝",
    br: "♜",
    bq: "♛",
    bk: "♚",
  };

  function getChessCtor() {
    if (typeof root.Chess === "function") {
      return root.Chess;
    }
    return null;
  }

  function ensureChessAvailable() {
    const ChessCtor = getChessCtor();
    if (!ChessCtor) {
      throw new Error("Chess.js is not loaded. Please check network/CDN access.");
    }
    return ChessCtor;
  }

  function createEngine() {
    const ChessCtor = ensureChessAvailable();
    return new ChessCtor();
  }

  function cloneEngine(chess) {
    const next = createEngine();
    safeLoadFen(next, chess.fen());
    return next;
  }

  function safeLoadFen(chess, fen) {
    if (typeof chess.load === "function") {
      chess.load(fen);
      return chess;
    }
    throw new Error("Current chess.js version does not support load(fen).");
  }

  function createGameFromSetup(setupMoves) {
    const chess = createEngine();
    applySanSequence(chess, setupMoves || []);
    return chess;
  }

  function applySanSequence(chess, moves) {
    for (const san of moves) {
      const result = chess.move(san);
      if (!result) {
        throw new Error(`Invalid SAN in sequence: ${san}`);
      }
    }
    return chess;
  }

  function replayLesson(lesson, stepIndex) {
    const chess = createEngine();
    const limit = Math.max(0, Math.min(Number.isInteger(stepIndex) ? stepIndex : 0, lesson.moves.length));
    for (let i = 0; i < limit; i += 1) {
      const san = lesson.moves[i].san;
      const result = chess.move(san);
      if (!result) {
        throw new Error(`Invalid lesson move at step ${i + 1}: ${san}`);
      }
    }
    return chess;
  }

  function getBoardSquares(chess) {
    const board = chess.board();
    const result = [];

    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const rank = 8 - row;
        const file = FILES[col];
        const square = `${file}${rank}`;
        const piece = board[row][col];
        const colorClass = (row + col) % 2 === 0 ? "light" : "dark";

        result.push({
          square,
          file,
          rank,
          colorClass,
          piece: piece
            ? {
                type: piece.type,
                color: piece.color,
                glyph: UNICODE_PIECES[`${piece.color}${piece.type}`] || "",
              }
            : null,
        });
      }
    }

    return result;
  }

  function getLegalMovesFrom(chess, square) {
    if (!square) {
      return [];
    }
    try {
      return chess.moves({ square, verbose: true }) || [];
    } catch (_) {
      return [];
    }
  }

  function normalizeSan(san) {
    return String(san || "")
      .replace(/[!?+#]+/g, "")
      .replace(/\s+/g, "")
      .trim();
  }

  function sanMatches(actualSan, expectedSan) {
    return normalizeSan(actualSan) === normalizeSan(expectedSan);
  }

  function callBoolMethod(chess, names) {
    for (const name of names) {
      if (typeof chess[name] === "function") {
        return Boolean(chess[name]());
      }
    }
    return false;
  }

  function isInCheck(chess) {
    return callBoolMethod(chess, ["isCheck", "inCheck", "in_check"]);
  }

  function isCheckmate(chess) {
    return callBoolMethod(chess, ["isCheckmate", "inCheckmate", "in_checkmate"]);
  }

  function isDraw(chess) {
    return callBoolMethod(chess, ["isDraw", "inDraw", "in_draw"]);
  }

  function isStalemate(chess) {
    return callBoolMethod(chess, ["isStalemate", "inStalemate", "in_stalemate"]);
  }

  function isThreefold(chess) {
    return callBoolMethod(chess, ["isThreefoldRepetition", "inThreefoldRepetition", "in_threefold_repetition"]);
  }

  function isInsufficientMaterial(chess) {
    return callBoolMethod(chess, ["isInsufficientMaterial", "insufficientMaterial", "insufficient_material"]);
  }

  function isGameOver(chess) {
    return callBoolMethod(chess, ["isGameOver", "game_over"]);
  }

  function getPositionStatus(chess) {
    const turn = typeof chess.turn === "function" ? chess.turn() : "w";
    const turnLabel = turn === "w" ? "白方" : "黑方";

    if (isCheckmate(chess)) {
      const winner = turn === "w" ? "黑方" : "白方";
      return {
        phase: "ended",
        kind: "checkmate",
        turn,
        statusText: `将死，${winner}获胜`,
        detailText: `${turnLabel}无子可解。`,
      };
    }

    if (isDraw(chess)) {
      let reason = "和棋";
      if (isStalemate(chess)) {
        reason = "逼和（无子可走）";
      } else if (isThreefold(chess)) {
        reason = "三次重复局面";
      } else if (isInsufficientMaterial(chess)) {
        reason = "子力不足";
      }
      return {
        phase: "ended",
        kind: "draw",
        turn,
        statusText: "和棋",
        detailText: reason,
      };
    }

    const inCheck = isInCheck(chess);
    return {
      phase: "playing",
      kind: inCheck ? "check" : "normal",
      turn,
      statusText: `${turnLabel}行棋`,
      detailText: inCheck ? `${turnLabel}被将军` : "进行中",
    };
  }

  function getMoveHistory(chess) {
    const history = typeof chess.history === "function" ? chess.history({ verbose: true }) : [];
    const rows = [];
    for (let i = 0; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = history[i + 1];
      rows.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: whiteMove ? whiteMove.san : "",
        black: blackMove ? blackMove.san : "",
      });
    }
    return rows;
  }

  function findKingSquare(chess, color) {
    const board = chess.board();
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const piece = board[row][col];
        if (piece && piece.type === "k" && piece.color === color) {
          return `${FILES[col]}${8 - row}`;
        }
      }
    }
    return null;
  }

  function getLastMoveSquareSet(chess) {
    const history = typeof chess.history === "function" ? chess.history({ verbose: true }) : [];
    const move = history.length > 0 ? history[history.length - 1] : null;
    if (!move) {
      return new Set();
    }
    return new Set([move.from, move.to]);
  }

  function getPromotionMoves(chess, fromSquare, toSquare) {
    return getLegalMovesFrom(chess, fromSquare).filter(
      (move) => move.to === toSquare && Object.prototype.hasOwnProperty.call(move, "promotion")
    );
  }

  function chooseMoveFromVerboseList(chess, fromSquare, toSquare, preferredPromotion) {
    const candidates = getLegalMovesFrom(chess, fromSquare).filter((move) => move.to === toSquare);
    if (candidates.length === 0) {
      return null;
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    return (
      candidates.find((move) => move.promotion === preferredPromotion) ||
      candidates.find((move) => move.promotion === "q") ||
      candidates[0]
    );
  }

  function getPieceAtSquare(chess, square) {
    if (typeof chess.get === "function") {
      return chess.get(square);
    }
    return null;
  }

  return {
    FILES,
    UNICODE_PIECES,
    createEngine,
    cloneEngine,
    createGameFromSetup,
    applySanSequence,
    replayLesson,
    getBoardSquares,
    getLegalMovesFrom,
    chooseMoveFromVerboseList,
    getPromotionMoves,
    getPieceAtSquare,
    normalizeSan,
    sanMatches,
    getPositionStatus,
    getMoveHistory,
    isGameOver,
    isCheckmate,
    isDraw,
    isInCheck,
    findKingSquare,
    getLastMoveSquareSet,
    safeLoadFen,
  };
});
