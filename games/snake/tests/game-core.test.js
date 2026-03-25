const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createInitialState,
  queueDirection,
  stepGame,
  placeFood,
} = require("../game-core.js");

function snakeIncludes(snake, point) {
  return snake.some((segment) => segment.x === point.x && segment.y === point.y);
}

test("createInitialState creates snake and food on empty cell", () => {
  const state = createInitialState({ rows: 8, cols: 8, randomFn: () => 0 });

  assert.equal(state.snake.length, 3);
  assert.equal(state.score, 0);
  assert.equal(state.gameOver, false);
  assert.equal(state.direction, "right");
  assert.equal(snakeIncludes(state.snake, state.food), false);
});

test("queueDirection blocks immediate reverse direction", () => {
  const state = createInitialState({ rows: 8, cols: 8, randomFn: () => 0 });
  const reversed = queueDirection(state, "left");
  const turned = queueDirection(state, "up");

  assert.equal(reversed.pendingDirection, null);
  assert.equal(turned.pendingDirection, "up");
});

test("stepGame moves snake forward without growth when no food eaten", () => {
  const state = {
    rows: 6,
    cols: 6,
    snake: [
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
    ],
    direction: "right",
    pendingDirection: null,
    food: { x: 5, y: 5 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = stepGame(state, () => 0);

  assert.deepEqual(next.snake, [
    { x: 4, y: 2 },
    { x: 3, y: 2 },
    { x: 2, y: 2 },
  ]);
  assert.equal(next.score, 0);
  assert.equal(next.food.x, 5);
  assert.equal(next.food.y, 5);
});

test("stepGame grows snake, increments score, and respawns food", () => {
  const state = {
    rows: 6,
    cols: 6,
    snake: [
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
    ],
    direction: "right",
    pendingDirection: null,
    food: { x: 4, y: 2 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = stepGame(state, () => 0);

  assert.equal(next.snake.length, 4);
  assert.equal(next.score, 1);
  assert.equal(snakeIncludes(next.snake, next.food), false);
});

test("stepGame sets gameOver on wall collision", () => {
  const state = {
    rows: 4,
    cols: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ],
    direction: "right",
    pendingDirection: null,
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = stepGame(state, () => 0);
  assert.equal(next.gameOver, true);
});

test("stepGame sets gameOver on self collision", () => {
  const state = {
    rows: 5,
    cols: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    direction: "left",
    pendingDirection: null,
    food: { x: 4, y: 4 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = stepGame(state, () => 0);
  assert.equal(next.gameOver, true);
});

test("placeFood returns null when board is full", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];

  assert.equal(placeFood(2, 2, snake, () => 0), null);
});
