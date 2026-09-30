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
      history: [],
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

    if (next.row < 0 || next.col < 0 || next.row >= game.rows || next.col >= game.cols || game.walls.has(nextKey)) {
      return game;
    }

    const boxes = cloneSet(game.boxes);
    let pushes = game.pushes;

    if (boxes.has(nextKey)) {
      const after = { row: next.row + dir.r, col: next.col + dir.c };
      const afterKey = key(after.row, after.col);
      if (after.row < 0 || after.col < 0 || after.row >= game.rows || after.col >= game.cols || game.walls.has(afterKey) || boxes.has(afterKey)) {
        return game;
      }
      boxes.delete(nextKey);
      boxes.add(afterKey);
      pushes += 1;
    }

    return {
      ...game,
      boxes,
      history: [...(game.history || []), { player: { ...game.player }, boxes: cloneSet(game.boxes), moves: game.moves, pushes: game.pushes, status: game.status }],
      player: next,
      moves: game.moves + 1,
      pushes,
      status: isSolved(boxes, game.targets) ? "won" : "playing",
    };
  }

  function createGameFromLevel(level) {
    const lines = level.map;
    if (!Array.isArray(lines) || lines.length < 3 || lines.some(line => line.length !== lines[0].length || /[^# .$@*+]/.test(line))) throw Error('Invalid map');
    if ((lines.join('').match(/[@+]/g) || []).length !== 1) throw Error('One player required');
    if ([...lines[0], ...lines.at(-1)].some(c => c !== '#') || lines.some(l => l[0] !== '#' || l.at(-1) !== '#')) throw Error('Closed boundary required');
    const parsed = parseLevel(lines);
    if (!parsed.boxes.size || parsed.boxes.size !== parsed.targets.size) throw Error('Boxes and goals must match');
    return { ...parsed, levelId: level.id, moves: 0, pushes: 0, history: [], status: 'playing' };
  }
  function undo(game) {
    if (!game.history?.length) return game;
    const before = game.history.at(-1);
    return { ...game, ...before, boxes: cloneSet(before.boxes), player: { ...before.player }, history: game.history.slice(0, -1) };
  }
  function cornerBoxes(game) {
    return [...game.boxes].filter(id => {
      if (game.targets.has(id)) return false;
      const [r,c] = id.split(':').map(Number);
      return (game.walls.has(key(r-1,c)) || game.walls.has(key(r+1,c))) && (game.walls.has(key(r,c-1)) || game.walls.has(key(r,c+1)));
    });
  }

  return {
    createGameFromLevel,
    undo,
    cornerBoxes,
    LEVELS,
    createGame,
    isSolved,
    move,
    parseLevel,
  };
});
