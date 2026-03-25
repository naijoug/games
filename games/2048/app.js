/* global Game2048Core */
(function () {
  const { createGame, move } = Game2048Core;
  const boardEl = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const newGameBtn = document.getElementById("new-game");
  const overlayEl = document.getElementById("overlay");
  const overlayTitleEl = document.getElementById("overlay-title");
  const overlayActionEl = document.getElementById("overlay-action");
  const bestKey = "mini-2048-best-score";

  let game = createGame();
  let bestScore = Number(localStorage.getItem(bestKey) || 0);
  let locked = false;

  function tileClass(value) {
    if (value === 0) {
      return "tile empty";
    }
    if (value > 2048) {
      return "tile vbig";
    }
    return `tile v${value}`;
  }

  function setBestScore(nextScore) {
    bestScore = Math.max(bestScore, nextScore);
    localStorage.setItem(bestKey, String(bestScore));
  }

  function render() {
    boardEl.innerHTML = "";
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        const value = game.board[r][c];
        const tile = document.createElement("div");
        tile.className = tileClass(value);
        tile.textContent = value === 0 ? "" : String(value);
        boardEl.appendChild(tile);
      }
    }

    scoreEl.textContent = String(game.score);
    bestEl.textContent = String(bestScore);
    renderOverlay();
  }

  function renderOverlay() {
    if (game.over) {
      overlayTitleEl.textContent = "Game Over";
      overlayEl.classList.remove("hidden");
      return;
    }
    if (game.won && !locked) {
      locked = true;
      overlayTitleEl.textContent = "You Win!";
      overlayEl.classList.remove("hidden");
      return;
    }
    overlayEl.classList.add("hidden");
  }

  function restartGame() {
    game = createGame();
    locked = false;
    overlayEl.classList.add("hidden");
    render();
  }

  function tryMove(direction) {
    if (game.over) {
      return;
    }
    game = move(game, direction);
    if (game.score > bestScore) {
      setBestScore(game.score);
    }
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
    const direction = mapKeyToDirection(event.key);
    if (!direction) {
      return;
    }
    event.preventDefault();
    tryMove(direction);
  });

  let startX = 0;
  let startY = 0;

  boardEl.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    },
    { passive: true },
  );

  boardEl.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const minDistance = 30;

      if (Math.abs(deltaX) < minDistance && Math.abs(deltaY) < minDistance) {
        return;
      }
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        tryMove(deltaX > 0 ? "right" : "left");
      } else {
        tryMove(deltaY > 0 ? "down" : "up");
      }
    },
    { passive: true },
  );

  newGameBtn.addEventListener("click", restartGame);
  overlayActionEl.addEventListener("click", restartGame);

  setBestScore(0);
  render();
})();
