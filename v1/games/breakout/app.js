/* global BreakoutCore */
(function () {
  const { createGame, movePaddle, stepGame } = BreakoutCore;

  const boardEl = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const statusEl = document.getElementById("status");
  const resetEl = document.getElementById("reset");
  const leftEl = document.getElementById("left");
  const rightEl = document.getElementById("right");

  let game = createGame();
  let intervalId = null;

  function cellClass(row, col) {
    if (game.ball.x === col && game.ball.y === row) {
      return "cell ball";
    }
    if (row === game.rows - 2 && col >= game.paddleX && col < game.paddleX + game.paddleWidth) {
      return "cell paddle";
    }
    if (row < game.bricks.length && game.bricks[row][col]) {
      return `cell brick brick-${row}`;
    }
    return "cell";
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    boardEl.style.setProperty("--cols", String(game.cols));
    for (let row = 0; row < game.rows; row += 1) {
      for (let col = 0; col < game.cols; col += 1) {
        const cell = document.createElement("div");
        cell.className = cellClass(row, col);
        boardEl.appendChild(cell);
      }
    }
  }

  function render() {
    scoreEl.textContent = String(game.score);
    livesEl.textContent = String(game.lives);
    statusEl.textContent = game.status === "playing" ? "Live" : game.status === "won" ? "Cleared" : "Offline";
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
    intervalId = setInterval(tick, 110);
  }

  function move(delta) {
    game = movePaddle(game, delta);
    render();
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
      event.preventDefault();
      move(1);
    }
  });

  leftEl.addEventListener("click", () => move(-1));
  rightEl.addEventListener("click", () => move(1));
  resetEl.addEventListener("click", () => {
    game = createGame();
    render();
    startLoop();
  });

  render();
  startLoop();
})();
