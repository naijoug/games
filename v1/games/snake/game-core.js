(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SnakeCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const DEFAULT_ROWS = 16;
  const DEFAULT_COLS = 16;
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  function isValidDirection(direction) {
    return Object.prototype.hasOwnProperty.call(DIRECTIONS, direction);
  }

  function isOpposite(a, b) {
    return (
      (a === "up" && b === "down") ||
      (a === "down" && b === "up") ||
      (a === "left" && b === "right") ||
      (a === "right" && b === "left")
    );
  }

  function pointsEqual(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function cloneSnake(snake) {
    return snake.map((segment) => ({ x: segment.x, y: segment.y }));
  }

  function createInitialSnake(rows, cols) {
    const length = Math.max(2, Math.min(3, cols));
    const y = Math.floor(rows / 2);
    const tailStart = Math.max(0, Math.floor(cols / 2) - (length - 1));
    const snake = [];

    for (let i = 0; i < length; i += 1) {
      snake.push({ x: tailStart + (length - 1 - i), y });
    }

    return snake;
  }

  function listEmptyCells(rows, cols, snake) {
    const occupied = new Set(snake.map((segment) => `${segment.x}:${segment.y}`));
    const cells = [];

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const key = `${x}:${y}`;
        if (!occupied.has(key)) {
          cells.push({ x, y });
        }
      }
    }

    return cells;
  }

  function placeFood(rows, cols, snake, randomFn = Math.random) {
    const empties = listEmptyCells(rows, cols, snake);
    if (empties.length === 0) {
      return null;
    }

    const rawIndex = Math.floor(randomFn() * empties.length);
    const index = Math.max(0, Math.min(empties.length - 1, rawIndex));
    return empties[index];
  }

  function createInitialState(options = {}) {
    const rows = Number.isInteger(options.rows) ? options.rows : DEFAULT_ROWS;
    const cols = Number.isInteger(options.cols) ? options.cols : DEFAULT_COLS;
    const randomFn = typeof options.randomFn === "function" ? options.randomFn : Math.random;
    const snake = createInitialSnake(rows, cols);

    return {
      rows,
      cols,
      snake,
      direction: "right",
      pendingDirection: null,
      food: placeFood(rows, cols, snake, randomFn),
      score: 0,
      gameOver: false,
      paused: false,
    };
  }

  function queueDirection(state, direction) {
    if (state.gameOver || !isValidDirection(direction)) {
      return state;
    }

    const baseDirection = state.pendingDirection || state.direction;
    if (isOpposite(baseDirection, direction)) {
      return state;
    }

    return {
      ...state,
      pendingDirection: direction,
    };
  }

  function togglePause(state) {
    if (state.gameOver) {
      return state;
    }

    return {
      ...state,
      paused: !state.paused,
    };
  }

  function collidesWithSnake(point, snake) {
    return snake.some((segment) => pointsEqual(segment, point));
  }

  function isOutOfBounds(point, rows, cols) {
    return point.x < 0 || point.y < 0 || point.x >= cols || point.y >= rows;
  }

  function stepGame(state, randomFn = Math.random) {
    if (state.gameOver || state.paused) {
      return state;
    }

    const direction = state.pendingDirection || state.direction;
    const movement = DIRECTIONS[direction] || DIRECTIONS.right;
    const head = state.snake[0];
    const nextHead = {
      x: head.x + movement.x,
      y: head.y + movement.y,
    };

    if (isOutOfBounds(nextHead, state.rows, state.cols)) {
      return {
        ...state,
        direction,
        pendingDirection: null,
        gameOver: true,
      };
    }

    const eating = state.food && pointsEqual(nextHead, state.food);
    const bodyForCollision = eating ? state.snake : state.snake.slice(0, -1);

    if (collidesWithSnake(nextHead, bodyForCollision)) {
      return {
        ...state,
        direction,
        pendingDirection: null,
        gameOver: true,
      };
    }

    const nextSnake = [{ x: nextHead.x, y: nextHead.y }, ...cloneSnake(state.snake)];
    if (!eating) {
      nextSnake.pop();
    }

    let food = state.food;
    let score = state.score;
    let gameOver = state.gameOver;

    if (eating) {
      score += 1;
      food = placeFood(state.rows, state.cols, nextSnake, randomFn);
      if (food === null) {
        gameOver = true;
      }
    }

    return {
      ...state,
      snake: nextSnake,
      direction,
      pendingDirection: null,
      food,
      score,
      gameOver,
    };
  }

  function restart(state, randomFn = Math.random) {
    return createInitialState({
      rows: state.rows,
      cols: state.cols,
      randomFn,
    });
  }

  return {
    createInitialState,
    queueDirection,
    stepGame,
    togglePause,
    placeFood,
    restart,
  };
});
