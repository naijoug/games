/* global PongCore */
(function () {
  const { createGame, movePlayer, stepGame } = PongCore;

  const boardEl = document.getElementById("board");
  const playerEl = document.getElementById("player-score");
  const cpuEl = document.getElementById("cpu-score");
  const statusEl = document.getElementById("status");
  const resetEl = document.getElementById("reset");
  const upEl = document.getElementById("up");
  const downEl = document.getElementById("down");

  let game = createGame();
  let intervalId = null;

  function isPaddle(row, col) {
    const left = col === 1 && row >= game.playerY && row < game.playerY + game.paddleHeight;
    const right = col === game.width - 2 && row >= game.cpuY && row < game.cpuY + game.paddleHeight;
    return left || right;
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    boardEl.style.setProperty("--cols", String(game.width));
    for (let row = 0; row < game.height; row += 1) {
      for (let col = 0; col < game.width; col += 1) {
        const cell = document.createElement("div");
        cell.className = "cell";
        if (game.ball.x === col && game.ball.y === row) {
          cell.classList.add("ball");
        } else if (isPaddle(row, col)) {
          cell.classList.add("paddle");
        } else if (col === Math.floor(game.width / 2) && row % 2 === 0) {
          cell.classList.add("net");
        }
        boardEl.appendChild(cell);
      }
    }
  }

  function render() {
    playerEl.textContent = String(game.playerScore);
    cpuEl.textContent = String(game.cpuScore);
    statusEl.textContent = game.status === "playing" ? "Rally" : game.status === "won" ? "Operator wins" : "CPU wins";
    renderBoard();
  }

  function tick() {
    game = stepGame(game);
    render();
    if (game.status !== "playing" && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startLoop() {
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(tick, 95);
  }

  function move(delta) {
    game = movePlayer(game, delta);
    render();
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
      event.preventDefault();
      move(1);
    }
  });

  upEl.addEventListener("click", () => move(-1));
  downEl.addEventListener("click", () => move(1));
  resetEl.addEventListener("click", () => {
    game = createGame();
    render();
    startLoop();
  });

  render();
  startLoop();
})();
