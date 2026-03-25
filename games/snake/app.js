/* global SnakeCore */
(function () {
  const { createInitialState, queueDirection, stepGame, togglePause, restart } = SnakeCore;

  const rows = 16;
  const cols = 16;
  const tickMs = 130;

  const boardEl = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const statusEl = document.getElementById("status");
  const pauseBtn = document.getElementById("pause");
  const restartBtn = document.getElementById("restart");
  const overlayEl = document.getElementById("overlay");
  const overlayTitleEl = document.getElementById("overlay-title");
  const overlayActionEl = document.getElementById("overlay-action");
  const controlButtons = document.querySelectorAll("[data-dir]");

  let state = createInitialState({ rows, cols });

  boardEl.style.setProperty("--grid-size", String(cols));

  function positionKey(point) {
    return `${point.x}:${point.y}`;
  }

  function renderBoard() {
    const snakePositions = new Set(state.snake.map(positionKey));
    const head = state.snake[0];
    const foodKey = state.food ? positionKey(state.food) : null;

    boardEl.innerHTML = "";

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const key = `${x}:${y}`;
        const cell = document.createElement("div");
        cell.className = "cell";

        if (snakePositions.has(key)) {
          cell.classList.add("snake");
        }
        if (head.x === x && head.y === y) {
          cell.classList.add("head");
        }
        if (foodKey === key) {
          cell.classList.add("food");
        }

        boardEl.appendChild(cell);
      }
    }
  }

  function renderStatus() {
    if (state.gameOver) {
      statusEl.textContent = "Game Over";
      pauseBtn.disabled = true;
      overlayTitleEl.textContent = "Game Over";
      overlayEl.classList.remove("hidden");
      return;
    }

    pauseBtn.disabled = false;
    overlayEl.classList.add("hidden");

    if (state.paused) {
      statusEl.textContent = "Paused";
      pauseBtn.textContent = "Resume";
    } else {
      statusEl.textContent = "Running";
      pauseBtn.textContent = "Pause";
    }
  }

  function render() {
    scoreEl.textContent = String(state.score);
    renderBoard();
    renderStatus();
  }

  function tick() {
    state = stepGame(state);
    render();
  }

  function queueTurn(direction) {
    state = queueDirection(state, direction);
  }

  function restartGame() {
    state = restart(state);
    render();
  }

  function mapKeyToDirection(key) {
    switch (key) {
      case "ArrowUp":
      case "w":
      case "W":
        return "up";
      case "ArrowDown":
      case "s":
      case "S":
        return "down";
      case "ArrowLeft":
      case "a":
      case "A":
        return "left";
      case "ArrowRight":
      case "d":
      case "D":
        return "right";
      default:
        return null;
    }
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      event.preventDefault();
      state = togglePause(state);
      render();
      return;
    }

    const direction = mapKeyToDirection(event.key);
    if (!direction) {
      return;
    }

    event.preventDefault();
    queueTurn(direction);
  });

  controlButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.getAttribute("data-dir");
      if (!direction) {
        return;
      }
      queueTurn(direction);
    });
  });

  pauseBtn.addEventListener("click", () => {
    state = togglePause(state);
    render();
  });

  restartBtn.addEventListener("click", restartGame);
  overlayActionEl.addEventListener("click", restartGame);

  setInterval(tick, tickMs);
  render();
})();
