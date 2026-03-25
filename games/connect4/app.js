/* global Connect4Core */
(function () {
  const { createGame, dropDisc } = Connect4Core;
  const boardEl = document.getElementById("board");
  const turnEl = document.getElementById("turn");
  const statusEl = document.getElementById("status");
  const restartBtn = document.getElementById("restart");

  let game = createGame();

  function turnText(mark) {
    if (mark === "R") return "Red";
    if (mark === "Y") return "Yellow";
    return "-";
  }

  function statusText() {
    if (game.status === "won") return `${turnText(game.winner)} Wins`;
    if (game.status === "draw") return "Draw";
    return "Playing";
  }

  function render() {
    boardEl.innerHTML = "";
    for (let r = 0; r < game.rows; r += 1) {
      for (let c = 0; c < game.cols; c += 1) {
        const value = game.board[r][c];
        const button = document.createElement("button");
        button.type = "button";
        button.className = `cell ${value ? value.toLowerCase() : ""}`.trim();
        button.ariaLabel = `Column ${c + 1}, Row ${r + 1}`;
        button.disabled = game.status !== "playing";
        button.addEventListener("click", () => {
          game = dropDisc(game, c);
          render();
        });
        boardEl.appendChild(button);
      }
    }
    turnEl.textContent = game.status === "playing" ? turnText(game.current) : "-";
    statusEl.textContent = statusText();
  }

  restartBtn.addEventListener("click", () => {
    game = createGame();
    render();
  });

  render();
})();
