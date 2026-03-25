const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createGame,
  createEmptyBoard,
  createPiece,
  getLegalMoves,
  getLegalMovesForPiece,
  makeMove,
  analyzeRepetition,
} = require('../game-core.js');

function makeCustomGame({ placements, sideToMove = 'red' }) {
  const board = createEmptyBoard();
  for (const item of placements) {
    board[item.row][item.col] = createPiece(item.side, item.type, item.id);
  }
  return createGame({ board, sideToMove });
}

function hasMove(moves, fromRow, fromCol, toRow, toCol) {
  return moves.some(
    (m) =>
      m.from.row === fromRow &&
      m.from.col === fromCol &&
      m.to.row === toRow &&
      m.to.col === toCol,
  );
}

test('createGame initializes standard board and red to move', () => {
  const game = createGame();

  assert.equal(game.board.length, 10);
  assert.equal(game.board[0].length, 9);
  assert.equal(game.sideToMove, 'red');
  assert.equal(game.status, 'playing');
  assert.equal(game.winner, null);
  assert.equal(game.board[9][4].type, 'king');
  assert.equal(game.board[9][4].side, 'red');
  assert.equal(game.board[0][4].type, 'king');
  assert.equal(game.board[0][4].side, 'black');
});

test('horse move is blocked by horse-leg', () => {
  const game = makeCustomGame({
    placements: [
      { row: 9, col: 4, side: 'red', type: 'king' },
      { row: 0, col: 4, side: 'black', type: 'king' },
      { row: 6, col: 4, side: 'red', type: 'pawn', id: 'r-block' },
      { row: 4, col: 4, side: 'red', type: 'horse', id: 'r-h1' },
      { row: 4, col: 5, side: 'red', type: 'pawn', id: 'r-px' },
    ],
  });

  const moves = getLegalMovesForPiece(game, 4, 4);
  assert.equal(hasMove(moves, 4, 4, 3, 6), false);
  assert.equal(hasMove(moves, 4, 4, 5, 6), false);
  assert.equal(hasMove(moves, 4, 4, 3, 2), true);
});

test('cannon capture requires exactly one screen piece', () => {
  const base = makeCustomGame({
    placements: [
      { row: 9, col: 4, side: 'red', type: 'king' },
      { row: 0, col: 4, side: 'black', type: 'king' },
      { row: 6, col: 4, side: 'red', type: 'pawn', id: 'r-block' },
      { row: 4, col: 4, side: 'red', type: 'cannon', id: 'r-c1' },
      { row: 4, col: 7, side: 'black', type: 'pawn', id: 'b-p1' },
    ],
  });

  let moves = getLegalMovesForPiece(base, 4, 4);
  assert.equal(hasMove(moves, 4, 4, 4, 7), false);

  const withScreen = makeCustomGame({
    placements: [
      { row: 9, col: 4, side: 'red', type: 'king' },
      { row: 0, col: 4, side: 'black', type: 'king' },
      { row: 6, col: 4, side: 'red', type: 'pawn', id: 'r-block' },
      { row: 4, col: 4, side: 'red', type: 'cannon', id: 'r-c1' },
      { row: 4, col: 6, side: 'red', type: 'pawn', id: 'r-p1' },
      { row: 4, col: 7, side: 'black', type: 'pawn', id: 'b-p1' },
    ],
  });

  moves = getLegalMovesForPiece(withScreen, 4, 4);
  assert.equal(hasMove(moves, 4, 4, 4, 7), true);
});

test('move that exposes kings facing each other is illegal', () => {
  const game = makeCustomGame({
    placements: [
      { row: 9, col: 4, side: 'red', type: 'king' },
      { row: 0, col: 4, side: 'black', type: 'king' },
      { row: 5, col: 4, side: 'red', type: 'rook', id: 'r-r1' },
    ],
  });

  const moved = makeMove(game, { from: { row: 5, col: 4 }, to: { row: 5, col: 3 } });
  assert.equal(moved, game);
});

test('when in check only legal responses are generated', () => {
  const game = makeCustomGame({
    placements: [
      { row: 9, col: 4, side: 'red', type: 'king' },
      { row: 0, col: 4, side: 'black', type: 'king' },
      { row: 5, col: 4, side: 'black', type: 'rook', id: 'b-r1' },
      { row: 6, col: 0, side: 'red', type: 'pawn', id: 'r-p1' },
    ],
    sideToMove: 'red',
  });

  const moves = getLegalMoves(game);
  assert.equal(moves.every((m) => m.from.col === 4 || (m.to.row === 5 && m.to.col === 4)), true);
  assert.equal(hasMove(moves, 6, 0, 5, 0), false);
});

test('analyzeRepetition flags common perpetual check as forbidden repeat loss', () => {
  const analysis = analyzeRepetition({
    currentPositionKey: 'K1',
    positionKeys: ['S0', 'K1', 'K2', 'K1', 'K2', 'K1'],
    recentMoves: [
      { side: 'red', givesCheck: true, chaseTargets: [] },
      { side: 'black', givesCheck: false, chaseTargets: [] },
      { side: 'red', givesCheck: true, chaseTargets: [] },
      { side: 'black', givesCheck: false, chaseTargets: [] },
      { side: 'red', givesCheck: true, chaseTargets: [] },
    ],
    moverSide: 'red',
  });

  assert.equal(analysis.type, 'forbidden-repeat-loss');
  assert.equal(analysis.loser, 'red');
  assert.equal(analysis.reason, 'long-check');
});

test('analyzeRepetition falls back to draw on ambiguous mutual repetition', () => {
  const analysis = analyzeRepetition({
    currentPositionKey: 'P',
    positionKeys: ['A', 'P', 'Q', 'P', 'Q', 'P'],
    recentMoves: [
      { side: 'red', givesCheck: false, chaseTargets: ['b-r1'] },
      { side: 'black', givesCheck: false, chaseTargets: ['r-r1'] },
      { side: 'red', givesCheck: false, chaseTargets: ['b-r1'] },
      { side: 'black', givesCheck: false, chaseTargets: ['r-r1'] },
      { side: 'red', givesCheck: false, chaseTargets: ['b-r1'] },
    ],
    moverSide: 'red',
  });

  assert.equal(analysis.type, 'draw');
});
