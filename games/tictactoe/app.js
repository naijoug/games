/* global TicTacToeCore */
(function () {
  const { createGame, makeMove } = TicTacToeCore;

  const boardEl = document.getElementById("board");
  const turnEl = document.getElementById("turn");
  const statusEl = document.getElementById("status");
  const restartBtn = document.getElementById("restart");

  let game = createGame();

  function statusText() {
    if (game.status === "won") {
      return `${game.winner} Wins`;
    }
    if (game.status === "draw") {
      return "Draw";
    }
    return "Playing";
  }

  function render() {
    boardEl.innerHTML = "";

    for (let i = 0; i < 9; i += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";
      button.textContent = game.board[i] || "";
      button.disabled = game.status !== "playing" || Boolean(game.board[i]);
      button.addEventListener("click", () => {
        game = makeMove(game, i);
        render();
      });
      boardEl.appendChild(button);
    }

    turnEl.textContent = game.status === "playing" ? game.current : "-";
    statusEl.textContent = statusText();
  }

  restartBtn.addEventListener("click", () => {
    game = createGame();
    render();
  });

  render();
})();
