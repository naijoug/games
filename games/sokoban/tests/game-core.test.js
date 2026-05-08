const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, isSolved, move, parseLevel } = require("../game-core.js");

test("parseLevel reads walls targets boxes and player", () => {
  const level = parseLevel(["#####", "#.@$#", "#####"]);

  assert.equal(level.walls.has("0:0"), true);
  assert.equal(level.targets.has("1:1"), true);
  assert.equal(level.boxes.has("1:3"), true);
  assert.deepEqual(level.player, { row: 1, col: 2 });
});

test("move blocks walking into wall", () => {
  const parsed = parseLevel(["#####", "#@  #", "#####"]);
  const game = { ...parsed, levelIndex: 0, moves: 0, pushes: 0, status: "playing" };
  const next = move(game, "up");

  assert.equal(next, game);
});

test("move pushes a box when destination is free", () => {
  const parsed = parseLevel(["#######", "#@$.  #", "#######"]);
  const game = { ...parsed, levelIndex: 0, moves: 0, pushes: 0, status: "playing" };
  const next = move(game, "right");

  assert.equal(next.boxes.has("1:3"), true);
  assert.equal(next.pushes, 1);
});

test("move refuses to push box into wall", () => {
  const parsed = parseLevel(["#####", "#@$##", "#####"]);
  const game = { ...parsed, levelIndex: 0, moves: 0, pushes: 0, status: "playing" };
  const next = move(game, "right");

  assert.equal(next, game);
});

test("isSolved requires every box on target", () => {
  assert.equal(isSolved(new Set(["1:1"]), new Set(["1:1"])), true);
  assert.equal(isSolved(new Set(["1:2"]), new Set(["1:1"])), false);
});
