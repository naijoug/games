/* global SokobanCore */
(function () {
  const { LEVELS, createGame, move } = SokobanCore;

  const boardEl = document.getElementById("board");
  const levelEl = document.getElementById("level");
  const movesEl = document.getElementById("moves");
  const pushesEl = document.getElementById("pushes");
  const statusEl = document.getElementById("status");
  const resetEl = document.getElementById("reset");
  const nextEl = document.getElementById("next");
  const controls = document.querySelectorAll("[data-dir]");

  let game = createGame();

  function cellClass(row, col) {
    const id = `${row}:${col}`;
    const classes = ["cell"];
    if (game.walls.has(id)) classes.push("wall");
    if (game.targets.has(id)) classes.push("target");
    if (game.boxes.has(id)) classes.push("box");
    if (game.player.row === row && game.player.col === col) classes.push("player");
    return classes.join(" ");
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
    levelEl.textContent = `${game.levelIndex + 1}/${LEVELS.length}`;
    movesEl.textContent = String(game.moves);
    pushesEl.textContent = String(game.pushes);
    statusEl.textContent = game.status === "won" ? "Solved" : "Pushing";
    renderBoard();
  }

  function applyMove(direction) {
    game = move(game, direction);
    render();
  }

  window.addEventListener("keydown", (event) => {
    const map = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      W: "up",
      s: "down",
      S: "down",
      a: "left",
      A: "left",
      d: "right",
      D: "right",
    };
    if (map[event.key]) {
      event.preventDefault();
      applyMove(map[event.key]);
    }
  });

  controls.forEach((button) => {
    button.addEventListener("click", () => applyMove(button.dataset.dir));
  });

  resetEl.addEventListener("click", () => {
    game = createGame(game.levelIndex);
    render();
  });

  nextEl.addEventListener("click", () => {
    game = createGame((game.levelIndex + 1) % LEVELS.length);
    render();
  });

  render();
})();
