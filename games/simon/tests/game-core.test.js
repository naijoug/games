const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, startRound, inputColor } = require("../game-core.js");

test("startRound adds one color to sequence and resets input index", () => {
  const game = createGame();
  const next = startRound(game, () => 0);

  assert.deepEqual(next.sequence, ["green"]);
  assert.equal(next.inputIndex, 0);
  assert.equal(next.status, "input");
});

test("inputColor advances through correct sequence", () => {
  let game = createGame({ sequence: ["green", "red"], status: "input", round: 2 });
  game = inputColor(game, "green");
  assert.equal(game.inputIndex, 1);
  assert.equal(game.status, "input");

  game = inputColor(game, "red");
  assert.equal(game.status, "round-complete");
  assert.equal(game.score, 2);
});

test("inputColor marks game over on mismatch", () => {
  const game = createGame({ sequence: ["green"], status: "input", round: 1 });
  const next = inputColor(game, "blue");

  assert.equal(next.status, "game-over");
  assert.equal(next.score, 0);
});

test("startRound after completion increments round", () => {
  let game = createGame();
  game = startRound(game, () => 0);
  game = inputColor(game, "green");
  game = startRound(game, () => 0.99);

  assert.equal(game.round, 2);
  assert.equal(game.sequence.length, 2);
});

const { replayRound } = require('../game-core.js');
test('junior retry preserves sequence and score, replay resets partial input',()=>{let s=createGame({mode:'kids',sequence:['green','red'],status:'input',score:1});s=inputColor(s,'blue');assert.equal(s.status,'retry');const n=replayRound(s);assert.deepEqual(n.sequence,s.sequence);assert.equal(n.score,1);assert.equal(n.inputIndex,0);assert.equal(n.status,'input');assert.equal(inputColor(n,'invalid'),n);assert.equal(startRound(n),n);});
test('junior completes exactly six successful signals, classic keeps growing',()=>{let s=createGame({mode:'kids'});for(let i=1;i<=6;i++){s=startRound(s,()=>0);for(let k=0;k<i;k++)s=inputColor(s,'green');assert.equal(s.status,i===6?'won':'round-complete');}assert.equal(startRound(s),s);assert.equal(inputColor(s,'green'),s);let c=createGame({sequence:Array(6).fill('green'),status:'input'});for(let i=0;i<6;i++)c=inputColor(c,'green');assert.equal(c.status,'round-complete');assert.equal(startRound(c,()=>0).sequence.length,7);});
