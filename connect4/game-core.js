(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Connect4Core = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const ROWS = 6;
  const COLS = 7;
  const DIRECTIONS = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function createGame() {
    return {
      rows: ROWS,
      cols: COLS,
      board: createBoard(),
      current: "R",
      status: "playing",
      winner: null,
    };
  }

  function inBounds(r, c) {
    return r >= 0 && c >= 0 && r < ROWS && c < COLS;
  }

  function countDirection(board, row, col, dr, dc, mark) {
    let count = 0;
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c) && board[r][c] === mark) {
      count += 1;
      r += dr;
      c += dc;
    }
    return count;
  }

  function isWinningMove(board, row, col, mark) {
    for (const [dr, dc] of DIRECTIONS) {
      const total =
        1 +
        countDirection(board, row, col, dr, dc, mark) +
        countDirection(board, row, col, -dr, -dc, mark);
      if (total >= 4) {
        return true;
      }
    }
    return false;
  }

  function boardFull(board) {
    return board[0].every((cell) => cell !== null);
  }

  function dropDisc(game, col) {
    if (game.status !== "playing" || !Number.isInteger(col) || col < 0 || col >= COLS) {
      return game;
    }

    let targetRow = -1;
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (game.board[row][col] === null) {
        targetRow = row;
        break;
      }
    }

    if (targetRow === -1) {
      return game;
    }

    const board = game.board.map((row) => row.slice());
    board[targetRow][col] = game.current;

    if (isWinningMove(board, targetRow, col, game.current)) {
      return {
        ...game,
        board,
        status: "won",
        winner: game.current,
      };
    }

    if (boardFull(board)) {
      return {
        ...game,
        board,
        status: "draw",
        winner: null,
      };
    }

    return {
      ...game,
      board,
      current: game.current === "R" ? "Y" : "R",
    };
  }

  return {
    createGame,
    dropDisc,
  };
});
