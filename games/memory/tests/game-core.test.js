const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, flipCard, resolveTurn } = require("../game-core.js");

test("createGame builds paired deck", () => {
  const game = createGame({ pairCount: 8, randomFn: () => 0.5 });
  assert.equal(game.cards.length, 16);

  const counts = new Map();
  for (const card of game.cards) {
    counts.set(card.value, (counts.get(card.value) || 0) + 1);
  }

  for (const count of counts.values()) {
    assert.equal(count, 2);
  }
});

test("flipCard matches pair and increases matched count", () => {
  const game = createGame({ pairCount: 2, deckValues: ["A", "A", "B", "B"] });
  const first = flipCard(game, 0);
  const second = flipCard(first, 1);

  assert.equal(second.matchedPairs, 1);
  assert.equal(second.cards[0].state, "matched");
  assert.equal(second.cards[1].state, "matched");
});

test("flipCard mismatch locks until resolveTurn", () => {
  const game = createGame({ pairCount: 2, deckValues: ["A", "B", "A", "B"] });
  const first = flipCard(game, 0);
  const second = flipCard(first, 1);

  assert.equal(second.locked, true);

  const resolved = resolveTurn(second);
  assert.equal(resolved.locked, false);
  assert.equal(resolved.cards[0].state, "down");
  assert.equal(resolved.cards[1].state, "down");
});

for(const count of [2,4,6,8])test(`complete ${count} pairs without reusing matched cards`,()=>{let s=createGame({pairCount:count,randomFn:()=>.5});const groups=new Map();s.cards.forEach((c,i)=>groups.set(c.value,[...(groups.get(c.value)||[]),i]));assert.equal(groups.size,count);for(const pair of groups.values()){assert.equal(pair.length,2);s=flipCard(s,pair[0]);assert.equal(flipCard(s,pair[0]),s);s=flipCard(s,pair[1]);assert.equal(flipCard(s,pair[1]),s);}assert.equal(s.status,'won');assert.equal(s.matchedPairs,count);});
test('invalid indexes cannot expose or change cards',()=>{const s=createGame({pairCount:2});for(const i of [-1,4,NaN,.5])assert.equal(flipCard(s,i),s);});
