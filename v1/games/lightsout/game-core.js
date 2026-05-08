(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LightsOutCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const SIZE = 5;
  const OFFSETS = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  function createEmptyBoard(size = SIZE) {
    return Array.from({ length: size }, () => Array(size).fill(false));
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function inBounds(board, row, col) {
    return row >= 0 && col >= 0 && row < board.length && col < board[row].length;
  }

  function toggleBoard(board, row, col) {
    if (!inBounds(board, row, col)) {
      return cloneBoard(board);
    }

    const next = cloneBoard(board);
    OFFSETS.forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (inBounds(next, r, c)) {
        next[r][c] = !next[r][c];
      }
    });
    return next;
  }

  function isSolved(board) {
    return board.every((row) => row.every((cell) => cell === false));
  }

  function scrambleBoard(size = SIZE, randomFn = Math.random, moves = 10) {
    let board = createEmptyBoard(size);
    for (let i = 0; i < moves; i += 1) {
      const row = Math.floor(randomFn() * size);
      const col = Math.floor(randomFn() * size);
      board = toggleBoard(board, row, col);
    }
    return board;
  }

  function createGame(options = {}) {
    const size = Number.isInteger(options.size) ? options.size : SIZE;
    const board = options.board ? cloneBoard(options.board) : scrambleBoard(size, options.randomFn, options.moves || 12);
    return {
      size,
      board,
      moves: 0,
      status: isSolved(board) ? "won" : "playing",
    };
  }

  function toggleCell(game, row, col) {
    if (game.status !== "playing" || !inBounds(game.board, row, col)) {
      return game;
    }

    const board = toggleBoard(game.board, row, col);
    return {
      ...game,
      board,
      moves: game.moves + 1,
      status: isSolved(board) ? "won" : "playing",
    };
  }

  return {
    SIZE,
    createEmptyBoard,
    createGame,
    isSolved,
    toggleBoard,
    toggleCell,
  };
});
