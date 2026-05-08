(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.InvadersCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const WIDTH = 14;
  const HEIGHT = 16;

  function key(row, col) {
    return `${row}:${col}`;
  }

  function createInvaders() {
    const invaders = [];
    for (let row = 1; row <= 3; row += 1) {
      for (let col = 3; col <= 10; col += 2) {
        invaders.push({ row, col });
      }
    }
    return invaders;
  }

  function createGame(options = {}) {
    return {
      width: WIDTH,
      height: HEIGHT,
      playerCol: Number.isInteger(options.playerCol) ? options.playerCol : Math.floor(WIDTH / 2),
      invaders: options.invaders ? options.invaders.map((invader) => ({ ...invader })) : createInvaders(),
      shots: options.shots ? options.shots.map((shot) => ({ ...shot })) : [],
      invaderDir: options.invaderDir || 1,
      score: options.score || 0,
      tick: 0,
      status: "playing",
    };
  }

  function movePlayer(game, delta) {
    if (game.status !== "playing") {
      return game;
    }

    return {
      ...game,
      playerCol: Math.max(0, Math.min(game.width - 1, game.playerCol + delta)),
    };
  }

  function fire(game) {
    if (game.status !== "playing") {
      return game;
    }

    const hasShot = game.shots.some((shot) => shot.col === game.playerCol);
    if (hasShot) {
      return game;
    }

    return {
      ...game,
      shots: [...game.shots, { row: game.height - 3, col: game.playerCol }],
    };
  }

  function moveInvaders(game) {
    const edgeHit = game.invaders.some((invader) => {
      const nextCol = invader.col + game.invaderDir;
      return nextCol < 0 || nextCol >= game.width;
    });

    if (edgeHit) {
      return {
        invaderDir: -game.invaderDir,
        invaders: game.invaders.map((invader) => ({ row: invader.row + 1, col: invader.col })),
      };
    }

    return {
      invaderDir: game.invaderDir,
      invaders: game.invaders.map((invader) => ({ row: invader.row, col: invader.col + game.invaderDir })),
    };
  }

  function stepGame(game) {
    if (game.status !== "playing") {
      return game;
    }

    const movedShots = game.shots
      .map((shot) => ({ row: shot.row - 1, col: shot.col }))
      .filter((shot) => shot.row >= 0);
    const hitKeys = new Set();
    let score = game.score;

    game.invaders.forEach((invader) => {
      if (movedShots.some((shot) => shot.row === invader.row && shot.col === invader.col)) {
        hitKeys.add(key(invader.row, invader.col));
        score += 10;
      }
    });

    const shots = movedShots.filter((shot) => !hitKeys.has(key(shot.row, shot.col)));
    let invaders = game.invaders.filter((invader) => !hitKeys.has(key(invader.row, invader.col)));
    let invaderDir = game.invaderDir;

    if ((game.tick + 1) % 4 === 0 && invaders.length > 0) {
      const moved = moveInvaders({ ...game, invaders });
      invaders = moved.invaders;
      invaderDir = moved.invaderDir;
    }

    let status = "playing";
    if (invaders.length === 0) {
      status = "won";
    } else if (invaders.some((invader) => invader.row >= game.height - 2)) {
      status = "lost";
    }

    return {
      ...game,
      invaders,
      shots,
      invaderDir,
      score,
      tick: game.tick + 1,
      status,
    };
  }

  return {
    WIDTH,
    HEIGHT,
    createGame,
    createInvaders,
    fire,
    movePlayer,
    stepGame,
  };
});
