(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MemoryCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  function shuffle(values, randomFn) {
    const list = values.slice();
    for (let i = list.length - 1; i > 0; i -= 1) {
      const raw = Math.floor(randomFn() * (i + 1));
      const j = Math.max(0, Math.min(i, raw));
      const temp = list[i];
      list[i] = list[j];
      list[j] = temp;
    }
    return list;
  }

  function cloneCards(cards) {
    return cards.map((card) => ({ ...card }));
  }

  function createDeck(pairCount, randomFn, deckValues) {
    if (Array.isArray(deckValues) && deckValues.length > 0) {
      return deckValues.slice();
    }

    const values = [];
    for (let i = 0; i < pairCount; i += 1) {
      const value = String.fromCharCode(65 + (i % 26)) + String(Math.floor(i / 26) || "");
      values.push(value, value);
    }
    return shuffle(values, randomFn);
  }

  function createGame(options) {
    const { pairCount = 8, randomFn = Math.random, deckValues = null } = options || {};
    const deck = createDeck(pairCount, randomFn, deckValues);

    const cards = deck.map((value, index) => ({
      id: index,
      value,
      state: "down",
    }));

    return {
      cards,
      status: "playing",
      moves: 0,
      matchedPairs: 0,
      openIndexes: [],
      locked: false,
      pairCount: Math.floor(cards.length / 2),
    };
  }

  function flipCard(game, index) {
    if (
      game.status !== "playing" ||
      game.locked ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= game.cards.length
    ) {
      return game;
    }

    const target = game.cards[index];
    if (target.state === "matched" || target.state === "up") {
      return game;
    }

    const cards = cloneCards(game.cards);
    const open = game.openIndexes.slice();

    cards[index].state = "up";
    open.push(index);

    if (open.length === 1) {
      return {
        ...game,
        cards,
        openIndexes: open,
      };
    }

    const [a, b] = open;
    const moves = game.moves + 1;

    if (cards[a].value === cards[b].value) {
      cards[a].state = "matched";
      cards[b].state = "matched";
      const matchedPairs = game.matchedPairs + 1;

      return {
        ...game,
        cards,
        moves,
        matchedPairs,
        openIndexes: [],
        status: matchedPairs >= game.pairCount ? "won" : "playing",
      };
    }

    return {
      ...game,
      cards,
      moves,
      openIndexes: open,
      locked: true,
    };
  }

  function resolveTurn(game) {
    if (!game.locked || game.openIndexes.length !== 2) {
      return game;
    }

    const cards = cloneCards(game.cards);
    for (const idx of game.openIndexes) {
      if (cards[idx].state === "up") {
        cards[idx].state = "down";
      }
    }

    return {
      ...game,
      cards,
      openIndexes: [],
      locked: false,
    };
  }

  return {
    createGame,
    flipCard,
    resolveTurn,
  };
});
