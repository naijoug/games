(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MinesweeperCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const NEIGHBORS = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  function inBounds(rows, cols, r, c) {
    return r >= 0 && c >= 0 && r < rows && c < cols;
  }

  function cloneCells(cells) {
    return cells.map((row) => row.map((cell) => ({ ...cell })));
  }

  function makeMineSet(rows, cols, mines, randomFn, minePositions) {
    const total = rows * cols;
    const picks = new Set();

    if (Array.isArray(minePositions)) {
      for (const idx of minePositions) {
        if (Number.isInteger(idx) && idx >= 0 && idx < total) {
          picks.add(idx);
        }
        if (picks.size >= mines) {
          break;
        }
      }
      return picks;
    }

    const pool = Array.from({ length: total }, (_, i) => i);
    while (picks.size < mines && pool.length > 0) {
      const raw = Math.floor(randomFn() * pool.length);
      const idx = Math.max(0, Math.min(pool.length - 1, raw));
      picks.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return picks;
  }

  function createCells(rows, cols, mineSet) {
    const cells = [];

    for (let r = 0; r < rows; r += 1) {
      const row = [];
      for (let c = 0; c < cols; c += 1) {
        const index = r * cols + c;
        row.push({
          mine: mineSet.has(index),
          revealed: false,
          flagged: false,
          adjacent: 0,
        });
      }
      cells.push(row);
    }

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (cells[r][c].mine) {
          continue;
        }

        let adjacent = 0;
        for (const [dr, dc] of NEIGHBORS) {
          const nr = r + dr;
          const nc = c + dc;
          if (inBounds(rows, cols, nr, nc) && cells[nr][nc].mine) {
            adjacent += 1;
          }
        }
        cells[r][c].adjacent = adjacent;
      }
    }

    return cells;
  }

  function countRevealedSafe(cells) {
    let count = 0;
    for (const row of cells) {
      for (const cell of row) {
        if (cell.revealed && !cell.mine) {
          count += 1;
        }
      }
    }
    return count;
  }

  function countFlags(cells) {
    let count = 0;
    for (const row of cells) {
      for (const cell of row) {
        if (cell.flagged) {
          count += 1;
        }
      }
    }
    return count;
  }

  function createGame(options) {
    const { rows = 9, cols = 9, mines = 10, randomFn = Math.random, minePositions = null } = options || {};
    const mineCount = Math.max(1, Math.min(mines, rows * cols - 1));
    const mineSet = makeMineSet(rows, cols, mineCount, randomFn, minePositions);
    const cells = createCells(rows, cols, mineSet);

    return {
      rows,
      cols,
      mines: mineCount,
      cells,
      status: "playing",
      revealedSafe: 0,
      flagsUsed: 0,
    };
  }

  function toggleFlag(game, row, col) {
    if (game.status !== "playing" || !inBounds(game.rows, game.cols, row, col)) {
      return game;
    }

    const current = game.cells[row][col];
    if (current.revealed) {
      return game;
    }

    const cells = cloneCells(game.cells);
    cells[row][col].flagged = !cells[row][col].flagged;

    return {
      ...game,
      cells,
      flagsUsed: countFlags(cells),
    };
  }

  function revealFlood(cells, rows, cols, startR, startC) {
    const queue = [[startR, startC]];
    const seen = new Set();

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      const key = `${r}:${c}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const cell = cells[r][c];
      if (cell.revealed || cell.flagged) {
        continue;
      }

      cell.revealed = true;
      if (cell.mine || cell.adjacent > 0) {
        continue;
      }

      for (const [dr, dc] of NEIGHBORS) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(rows, cols, nr, nc)) {
          queue.push([nr, nc]);
        }
      }
    }
  }

  function revealCell(game, row, col) {
    if (game.status !== "playing" || !inBounds(game.rows, game.cols, row, col)) {
      return game;
    }

    const start = game.cells[row][col];
    if (start.revealed || start.flagged) {
      return game;
    }

    const cells = cloneCells(game.cells);
    const cell = cells[row][col];

    if (cell.mine) {
      cell.revealed = true;
      for (const line of cells) {
        for (const item of line) {
          if (item.mine) {
            item.revealed = true;
          }
        }
      }

      return {
        ...game,
        cells,
        status: "lost",
        revealedSafe: countRevealedSafe(cells),
        flagsUsed: countFlags(cells),
      };
    }

    revealFlood(cells, game.rows, game.cols, row, col);
    const revealedSafe = countRevealedSafe(cells);
    const target = game.rows * game.cols - game.mines;

    return {
      ...game,
      cells,
      revealedSafe,
      flagsUsed: countFlags(cells),
      status: revealedSafe >= target ? "won" : "playing",
    };
  }

  return {
    createGame,
    toggleFlag,
    revealCell,
  };
});
