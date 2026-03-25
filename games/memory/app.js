/* global MemoryCore */
(function () {
  const { createGame, flipCard, resolveTurn } = MemoryCore;

  const boardEl = document.getElementById("board");
  const movesEl = document.getElementById("moves");
  const pairsEl = document.getElementById("pairs");
  const statusEl = document.getElementById("status");
  const restartBtn = document.getElementById("restart");

  let game = createGame({ pairCount: 8 });
  let resolving = false;

  function statusText() {
    return game.status === "won" ? "Won" : "Playing";
  }

  function scheduleResolve() {
    if (!game.locked || resolving) {
      return;
    }

    resolving = true;
    window.setTimeout(() => {
      game = resolveTurn(game);
      resolving = false;
      render();
    }, 500);
  }

  function onFlip(index) {
    if (resolving) {
      return;
    }

    game = flipCard(game, index);
    render();
    scheduleResolve();
  }

  function render() {
    boardEl.innerHTML = "";

    game.cards.forEach((card, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `card ${card.state}`;
      button.textContent = card.state === "down" ? "" : card.value;
      button.disabled = game.status !== "playing" || card.state === "matched" || resolving;
      button.addEventListener("click", () => onFlip(index));
      boardEl.appendChild(button);
    });

    movesEl.textContent = String(game.moves);
    pairsEl.textContent = `${game.matchedPairs} / ${game.pairCount}`;
    statusEl.textContent = statusText();
  }

  restartBtn.addEventListener("click", () => {
    game = createGame({ pairCount: 8 });
    resolving = false;
    render();
  });

  render();
})();
