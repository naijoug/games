/* global HackerwordCore */
(function () {
  const { createGame, submitGuess } = HackerwordCore;

  const gridEl = document.getElementById("grid");
  const inputEl = document.getElementById("guess");
  const submitEl = document.getElementById("submit");
  const resetEl = document.getElementById("reset");
  const statusEl = document.getElementById("status");
  const attemptsEl = document.getElementById("attempts");
  const secretEl = document.getElementById("secret");

  let game = createGame();

  function renderGrid() {
    gridEl.innerHTML = "";
    for (let row = 0; row < game.maxAttempts; row += 1) {
      const entry = game.guesses[row];
      for (let col = 0; col < game.length; col += 1) {
        const tile = document.createElement("span");
        tile.className = "tile";
        if (entry) {
          tile.textContent = entry.word[col];
          tile.classList.add(entry.score[col]);
        } else {
          tile.textContent = "_";
        }
        gridEl.appendChild(tile);
      }
    }
  }

  function renderStatus() {
    attemptsEl.textContent = `${game.guesses.length}/${game.maxAttempts}`;
    secretEl.textContent = game.status === "playing" ? "*".repeat(game.length) : game.secret;
    statusEl.textContent = game.status === "won" ? "Rooted" : game.status === "lost" ? "Denied" : "Scanning";
    inputEl.maxLength = game.length;
    inputEl.placeholder = `${game.length} letters`;
    inputEl.disabled = game.status !== "playing";
    submitEl.disabled = game.status !== "playing";
  }

  function render() {
    renderGrid();
    renderStatus();
  }

  function submit() {
    game = submitGuess(game, inputEl.value);
    inputEl.value = "";
    render();
    inputEl.focus();
  }

  submitEl.addEventListener("click", submit);
  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submit();
    }
  });

  resetEl.addEventListener("click", () => {
    game = createGame();
    inputEl.value = "";
    render();
    inputEl.focus();
  });

  render();
})();
