(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Game2048Core = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const SIZE = 4;
  const WIN_VALUE = 2048;

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function createEmptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function isWinningBoard(board) {
    return board.some((row) => row.some((cell) => cell >= WIN_VALUE));
  }

  function hasAvailableMoves(board) {
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        const value = board[r][c];
        if (value === 0) {
          return true;
        }
        if (c + 1 < SIZE && value === board[r][c + 1]) {
          return true;
        }
        if (r + 1 < SIZE && value === board[r + 1][c]) {
          return true;
        }
      }
    }
    return false;
  }

  function mergeLineLeft(line) {
    const compact = line.filter((n) => n !== 0);
    const merged = [];
    let scoreGain = 0;

    for (let i = 0; i < compact.length; i += 1) {
      if (compact[i] === compact[i + 1]) {
        const value = compact[i] * 2;
        merged.push(value);
        scoreGain += value;
        i += 1;
      } else {
        merged.push(compact[i]);
      }
    }

    while (merged.length < SIZE) {
      merged.push(0);
    }

    return { line: merged, scoreGain };
  }

  function runMove(board, direction) {
    const next = createEmptyBoard();
    let scoreGain = 0;

    if (direction === "left" || direction === "right") {
      for (let r = 0; r < SIZE; r += 1) {
        const source = direction === "left" ? board[r].slice() : board[r].slice().reverse();
        const { line, scoreGain: gain } = mergeLineLeft(source);
        scoreGain += gain;
        next[r] = direction === "left" ? line : line.slice().reverse();
      }
    } else if (direction === "up" || direction === "down") {
      for (let c = 0; c < SIZE; c += 1) {
        const column = [];
        for (let r = 0; r < SIZE; r += 1) {
          column.push(direction === "up" ? board[r][c] : board[SIZE - 1 - r][c]);
        }
        const { line, scoreGain: gain } = mergeLineLeft(column);
        scoreGain += gain;
        for (let r = 0; r < SIZE; r += 1) {
          if (direction === "up") {
            next[r][c] = line[r];
          } else {
            next[SIZE - 1 - r][c] = line[r];
          }
        }
      }
    } else {
      return { board: cloneBoard(board), scoreGain: 0, moved: false };
    }

    const moved = JSON.stringify(next) !== JSON.stringify(board);
    return { board: next, scoreGain, moved };
  }

  function spawnRandomTile(board, randomFn = Math.random) {
    const empties = [];
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        if (board[r][c] === 0) {
          empties.push([r, c]);
        }
      }
    }
    if (empties.length === 0) {
      return cloneBoard(board);
    }

    const choiceIndex = Math.floor(randomFn() * empties.length);
    const [row, col] = empties[choiceIndex];
    const value = randomFn() < 0.9 ? 2 : 4;
    const next = cloneBoard(board);
    next[row][col] = value;
    return next;
  }

  function createGame(randomFn = Math.random) {
    let board = createEmptyBoard();
    board = spawnRandomTile(board, randomFn);
    board = spawnRandomTile(board, randomFn);
    return {
      board,
      score: 0,
      won: false,
      over: false,
      moved: false,
    };
  }

  function move(game, direction, randomFn = Math.random) {
    const { board, scoreGain, moved } = runMove(game.board, direction);
    const nextBoard = moved ? spawnRandomTile(board, randomFn) : board;
    const nextScore = game.score + scoreGain;
    const won = game.won || isWinningBoard(nextBoard);
    const over = !hasAvailableMoves(nextBoard);

    return {
      board: nextBoard,
      score: nextScore,
      won,
      over,
      moved,
    };
  }

  return {
    SIZE,
    createGame,
    move,
    hasAvailableMoves,
    isWinningBoard,
  };
});
