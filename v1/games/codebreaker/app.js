/* global CodebreakerCore */
(function () {
  const { COLORS, CODE_LENGTH, createGame, submitGuess } = CodebreakerCore;

  const boardEl = document.getElementById("history");
  const statusEl = document.getElementById("status");
  const attemptsEl = document.getElementById("attempts");
  const pickerEl = document.getElementById("picker");
  const currentEl = document.getElementById("current");
  const submitEl = document.getElementById("submit");
  const resetEl = document.getElementById("reset");
  const revealEl = document.getElementById("reveal");

  let game = createGame();
  let draft = [];

  function renderDraft() {
    currentEl.innerHTML = "";
    for (let i = 0; i < CODE_LENGTH; i += 1) {
      const slot = document.createElement("span");
      slot.className = "peg draft";
      slot.dataset.value = draft[i] || "";
      slot.textContent = draft[i] || "_";
      currentEl.appendChild(slot);
    }
    submitEl.disabled = draft.length !== CODE_LENGTH || game.status !== "playing";
  }

  function renderHistory() {
    boardEl.innerHTML = "";
    game.guesses.slice().reverse().forEach((entry) => {
      const row = document.createElement("div");
      row.className = "guess-row";

      const code = document.createElement("div");
      code.className = "guess-code";
      entry.guess.forEach((value) => {
        const peg = document.createElement("span");
        peg.className = "peg";
        peg.dataset.value = value;
        peg.textContent = value;
        code.appendChild(peg);
      });

      const feedback = document.createElement("span");
      feedback.className = "feedback";
      feedback.textContent = `${entry.feedback.exact} exact / ${entry.feedback.present} trace`;

      row.append(code, feedback);
      boardEl.appendChild(row);
    });
  }

  function renderStatus() {
    attemptsEl.textContent = `${game.guesses.length}/${game.maxAttempts}`;
    revealEl.textContent = game.status === "playing" ? "****" : game.secret.join("");
    if (game.status === "won") {
      statusEl.textContent = "Access granted";
    } else if (game.status === "lost") {
      statusEl.textContent = "Lockout";
    } else {
      statusEl.textContent = "Cracking";
    }
  }

  function render() {
    renderDraft();
    renderHistory();
    renderStatus();
  }

  COLORS.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.dataset.value = value;
    button.textContent = value;
    button.addEventListener("click", () => {
      if (draft.length < CODE_LENGTH && game.status === "playing") {
        draft.push(value);
        renderDraft();
      }
    });
    pickerEl.appendChild(button);
  });

  currentEl.addEventListener("click", () => {
    draft.pop();
    renderDraft();
  });

  submitEl.addEventListener("click", () => {
    game = submitGuess(game, draft);
    draft = [];
    render();
  });

  resetEl.addEventListener("click", () => {
    game = createGame();
    draft = [];
    render();
  });

  window.addEventListener("keydown", (event) => {
    if (COLORS.includes(event.key)) {
      if (draft.length < CODE_LENGTH && game.status === "playing") {
        draft.push(event.key);
        renderDraft();
      }
    } else if (event.key === "Backspace") {
      draft.pop();
      renderDraft();
    } else if (event.key === "Enter" && draft.length === CODE_LENGTH) {
      game = submitGuess(game, draft);
      draft = [];
      render();
    }
  });

  render();
})();
