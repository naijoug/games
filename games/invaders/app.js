/* global InvadersCore */
(function () {
  const { createGame, fire, movePlayer, stepGame } = InvadersCore;

  const boardEl = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const statusEl = document.getElementById("status");
  const enemiesEl = document.getElementById("enemies");
  const resetEl = document.getElementById("reset");
  const leftEl = document.getElementById("left");
  const rightEl = document.getElementById("right");
  const fireEl = document.getElementById("fire");

  let game = createGame();
  let intervalId = null;

  function hasInvader(row, col) {
    return game.invaders.some((invader) => invader.row === row && invader.col === col);
  }

  function hasShot(row, col) {
    return game.shots.some((shot) => shot.row === row && shot.col === col);
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    boardEl.style.setProperty("--cols", String(game.width));
    for (let row = 0; row < game.height; row += 1) {
      for (let col = 0; col < game.width; col += 1) {
        const cell = document.createElement("div");
        cell.className = "cell";
        if (hasInvader(row, col)) {
          cell.classList.add("invader");
        } else if (hasShot(row, col)) {
          cell.classList.add("shot");
        } else if (row === game.height - 1 && col === game.playerCol) {
          cell.classList.add("player");
        }
        boardEl.appendChild(cell);
      }
    }
  }

  function render() {
    scoreEl.textContent = String(game.score);
    enemiesEl.textContent = String(game.invaders.length);
    statusEl.textContent = game.status === "playing" ? "Defending" : game.status === "won" ? "Sector clear" : "Overrun";
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
    intervalId = setInterval(tick, 120);
  }

  function move(delta) {
    game = movePlayer(game, delta);
    render();
  }

  function shoot() {
    game = fire(game);
    render();
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
      event.preventDefault();
      move(1);
    } else if (event.key === " " || event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
      event.preventDefault();
      shoot();
    }
  });

  leftEl.addEventListener("click", () => move(-1));
  rightEl.addEventListener("click", () => move(1));
  fireEl.addEventListener("click", shoot);
  resetEl.addEventListener("click", () => {
    game = createGame();
    render();
    startLoop();
  });

  render();
  startLoop();
})();
