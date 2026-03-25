(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TicTacToeCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function createGame() {
    return {
      board: Array(9).fill(null),
      current: "X",
      status: "playing",
      winner: null,
    };
  }

  function findWinner(board) {
    for (const [a, b, c] of WIN_LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  function makeMove(game, index) {
    if (
      game.status !== "playing" ||
      !Number.isInteger(index) ||
      index < 0 ||
      index > 8 ||
      game.board[index]
    ) {
      return game;
    }

    const board = game.board.slice();
    board[index] = game.current;

    const winner = findWinner(board);
    if (winner) {
      return {
        board,
        current: game.current,
        status: "won",
        winner,
      };
    }

    if (board.every((cell) => cell !== null)) {
      return {
        board,
        current: game.current,
        status: "draw",
        winner: null,
      };
    }

    return {
      board,
      current: game.current === "X" ? "O" : "X",
      status: "playing",
      winner: null,
    };
  }

  return {
    createGame,
    makeMove,
  };
});
