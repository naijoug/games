(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SokobanCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const LEVELS = [
    [
      "#######",
      "#     #",
      "# .$@ #",
      "#  .  #",
      "#  $  #",
      "#     #",
      "#######",
    ],
    [
      "########",
      "#   .  #",
      "#  $$  #",
      "#  @.  #",
      "#      #",
      "########",
    ],
    [
      "#########",
      "#   #   #",
      "# $ . $ #",
      "#   @   #",
      "# .   . #",
      "#########",
    ],
  ];

  const DIRS = {
    up: { r: -1, c: 0 },
    down: { r: 1, c: 0 },
    left: { r: 0, c: -1 },
    right: { r: 0, c: 1 },
  };

  function key(row, col) {
    return `${row}:${col}`;
  }

  function parseLevel(lines) {
    const walls = new Set();
    const targets = new Set();
    const boxes = new Set();
    let player = { row: 0, col: 0 };

    lines.forEach((line, row) => {
      [...line].forEach((cell, col) => {
        if (cell === "#") {
          walls.add(key(row, col));
        }
        if (cell === "." || cell === "*" || cell === "+") {
          targets.add(key(row, col));
        }
        if (cell === "$" || cell === "*") {
          boxes.add(key(row, col));
        }
        if (cell === "@" || cell === "+") {
          player = { row, col };
        }
      });
    });

    return {
      rows: lines.length,
      cols: Math.max(...lines.map((line) => line.length)),
      walls,
      targets,
      boxes,
      player,
    };
  }

  function cloneSet(set) {
    return new Set([...set]);
  }

  function createGame(levelIndex = 0) {
    const index = Math.max(0, Math.min(LEVELS.length - 1, levelIndex));
    const parsed = parseLevel(LEVELS[index]);
    return {
      ...parsed,
      levelIndex: index,
      moves: 0,
      pushes: 0,
      status: "playing",
    };
  }

  function isSolved(boxes, targets) {
    return [...boxes].every((box) => targets.has(box));
  }

  function move(game, direction) {
    if (game.status !== "playing" || !DIRS[direction]) {
      return game;
    }

    const dir = DIRS[direction];
    const next = { row: game.player.row + dir.r, col: game.player.col + dir.c };
    const nextKey = key(next.row, next.col);

    if (game.walls.has(nextKey)) {
      return game;
    }

    const boxes = cloneSet(game.boxes);
    let pushes = game.pushes;

    if (boxes.has(nextKey)) {
      const after = { row: next.row + dir.r, col: next.col + dir.c };
      const afterKey = key(after.row, after.col);
      if (game.walls.has(afterKey) || boxes.has(afterKey)) {
        return game;
      }
      boxes.delete(nextKey);
      boxes.add(afterKey);
      pushes += 1;
    }

    return {
      ...game,
      boxes,
      player: next,
      moves: game.moves + 1,
      pushes,
      status: isSolved(boxes, game.targets) ? "won" : "playing",
    };
  }

  return {
    LEVELS,
    createGame,
    isSolved,
    move,
    parseLevel,
  };
});
