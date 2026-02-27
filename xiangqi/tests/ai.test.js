const test = require('node:test');
const assert = require('node:assert/strict');
const XiangqiCore = require('../game-core.js');
const XiangqiAI = require('../ai.js');

const { createGame, createEmptyBoard, createPiece, getLegalMoves, makeMove } = XiangqiCore;
const { chooseMove } = XiangqiAI;

function makeCustomGame({ placements, sideToMove = 'red' }) {
  const board = createEmptyBoard();
  for (const item of placements) {
    board[item.row][item.col] = createPiece(item.side, item.type, item.id);
  }
  return createGame({ board, sideToMove });
}

function isSameMove(a, b) {
  return (
    a &&
    b &&
    a.from.row === b.from.row &&
    a.from.col === b.from.col &&
    a.to.row === b.to.row &&
    a.to.col === b.to.col
  );
}

test('AI returns a legal move on initial position for all levels', () => {
  const levels = ['easy', 'medium', 'hard'];

  for (const level of levels) {
    const game = createGame();
    const legal = getLegalMoves(game);
    const move = chooseMove(game, { level, timeBudgetMs: 120 });

    assert.ok(move, `missing move for level ${level}`);
    assert.equal(legal.some((m) => isSameMove(m, move)), true, `illegal move for level ${level}`);
  }
});

test('AI produces a legal response when side is in check', () => {
  const game = makeCustomGame({
    placements: [
      { row: 9, col: 4, side: 'red', type: 'king', id: 'r-k' },
      { row: 0, col: 4, side: 'black', type: 'king', id: 'b-k' },
      { row: 5, col: 4, side: 'black', type: 'rook', id: 'b-r1' },
      { row: 9, col: 0, side: 'red', type: 'rook', id: 'r-r1' },
    ],
    sideToMove: 'red',
  });

  assert.equal(game.status, 'check');
  const legal = getLegalMoves(game);
  const move = chooseMove(game, { level: 'medium', timeBudgetMs: 150 });
  assert.equal(legal.some((m) => isSameMove(m, move)), true);

  const next = makeMove(game, move);
  assert.notEqual(next, game);
  assert.equal(next.winner, null);
});

test('hard AI returns within time budget margin', () => {
  const game = createGame();
  const started = Date.now();
  const move = chooseMove(game, { level: 'hard', timeBudgetMs: 80 });
  const elapsed = Date.now() - started;

  assert.ok(move);
  assert.ok(elapsed < 500, `AI took too long: ${elapsed}ms`);
});
