/* global MinesweeperCore */
(function () {
  const { createGame, revealCell, toggleFlag } = MinesweeperCore;

  const rows = 9;
  const cols = 9;
  const mines = 10;

  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const minesLeftEl = document.getElementById("mines-left");
  const restartBtn = document.getElementById("restart");

  let game = createGame({ rows, cols, mines });

  function cellText(cell) {
    if (cell.flagged && !cell.revealed) {
      return "F";
    }
    if (!cell.revealed) {
      return "";
    }
    if (cell.mine) {
      return "M";
    }
    return cell.adjacent === 0 ? "" : String(cell.adjacent);
  }

  function statusText() {
    if (game.status === "won") {
      return "Won";
    }
    if (game.status === "lost") {
      return "Lost";
    }
    return "Playing";
  }

  function render() {
    boardEl.innerHTML = "";

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cell = game.cells[r][c];
        const button = document.createElement("button");
        button.type = "button";
        button.className = "cell";
        button.textContent = cellText(cell);

        if (cell.revealed) {
          button.classList.add("revealed");
        }
        if (cell.flagged) {
          button.classList.add("flagged");
        }
        if (cell.revealed && cell.mine) {
          button.classList.add("mine");
        }

        if (game.status !== "playing") {
          button.disabled = true;
        }

        button.addEventListener("click", () => {
          game = revealCell(game, r, c);
          render();
        });

        button.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          game = toggleFlag(game, r, c);
          render();
        });

        boardEl.appendChild(button);
      }
    }

    statusEl.textContent = statusText();
    minesLeftEl.textContent = String(Math.max(0, game.mines - game.flagsUsed));
  }

  restartBtn.addEventListener("click", () => {
    game = createGame({ rows, cols, mines });
    render();
  });

  render();
})();
