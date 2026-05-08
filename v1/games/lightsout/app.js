/* global LightsOutCore */
(function () {
  const { createGame, toggleCell } = LightsOutCore;

  const boardEl = document.getElementById("board");
  const movesEl = document.getElementById("moves");
  const statusEl = document.getElementById("status");
  const resetEl = document.getElementById("reset");

  let game = createGame();

  function renderBoard() {
    boardEl.innerHTML = "";
    boardEl.style.setProperty("--grid-size", String(game.size));
    game.board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = cell ? "light on" : "light";
        button.setAttribute("aria-label", `Toggle ${rowIndex + 1},${colIndex + 1}`);
        button.addEventListener("click", () => {
          game = toggleCell(game, rowIndex, colIndex);
          render();
        });
        boardEl.appendChild(button);
      });
    });
  }

  function render() {
    movesEl.textContent = String(game.moves);
    statusEl.textContent = game.status === "won" ? "Dark grid" : "Lights leaking";
    renderBoard();
  }

  resetEl.addEventListener("click", () => {
    game = createGame();
    render();
  });

  render();
})();
