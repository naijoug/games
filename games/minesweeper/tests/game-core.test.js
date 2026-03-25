const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, revealCell, toggleFlag } = require("../game-core.js");

function read(g, r, c) {
  return g.cells[r][c];
}

test("createGame places exact number of mines", () => {
  const game = createGame({ rows: 4, cols: 4, mines: 3, minePositions: [0, 5, 10] });
  const count = game.cells.flat().filter((cell) => cell.mine).length;
  assert.equal(count, 3);
  assert.equal(game.status, "playing");
});

test("toggleFlag marks and unmarks hidden cells", () => {
  const game = createGame({ rows: 3, cols: 3, mines: 1, minePositions: [0] });
  const flagged = toggleFlag(game, 0, 0);
  assert.equal(read(flagged, 0, 0).flagged, true);

  const unflagged = toggleFlag(flagged, 0, 0);
  assert.equal(read(unflagged, 0, 0).flagged, false);
});

test("revealCell on mine ends game", () => {
  const game = createGame({ rows: 3, cols: 3, mines: 1, minePositions: [0] });
  const next = revealCell(game, 0, 0);

  assert.equal(next.status, "lost");
  assert.equal(read(next, 0, 0).revealed, true);
});

test("revealCell expands zero-adjacent area", () => {
  const game = createGame({ rows: 3, cols: 3, mines: 1, minePositions: [8] });
  const next = revealCell(game, 0, 0);

  assert.equal(read(next, 0, 0).revealed, true);
  assert.equal(read(next, 0, 1).revealed, true);
  assert.equal(read(next, 1, 0).revealed, true);
});

test("game is won when all safe cells are revealed", () => {
  let game = createGame({ rows: 2, cols: 2, mines: 1, minePositions: [3] });
  game = revealCell(game, 0, 0);
  game = revealCell(game, 0, 1);
  game = revealCell(game, 1, 0);

  assert.equal(game.status, "won");
});
