/* global SimonCore */
(function () {
  const { COLORS, createGame, startRound, inputColor } = SimonCore;
  const roundEl = document.getElementById("round");
  const scoreEl = document.getElementById("score");
  const statusEl = document.getElementById("status");
  const startNextBtn = document.getElementById("start-next");
  const restartBtn = document.getElementById("restart");
  const pads = Array.from(document.querySelectorAll(".pad"));

  let game = createGame();
  let playback = false;
  let activeColor = null;

  function statusText() {
    if (playback) return "Watch";
    if (game.status === "idle") return "Idle";
    if (game.status === "input") return "Repeat";
    if (game.status === "round-complete") return "Round Clear";
    if (game.status === "game-over") return "Game Over";
    return game.status;
  }

  function buttonLabel() {
    if (game.status === "idle") return "Start Round";
    if (game.status === "round-complete") return "Next Round";
    if (game.status === "game-over") return "Start Again";
    return "Playing";
  }

  function setPadsEnabled(enabled) {
    for (const pad of pads) {
      pad.disabled = !enabled;
    }
  }

  function highlight(color) {
    activeColor = color;
    for (const pad of pads) {
      pad.classList.toggle("active", pad.dataset.color === color);
    }
  }

  function clearHighlight() {
    highlight(null);
  }

  function render() {
    roundEl.textContent = String(game.round);
    scoreEl.textContent = String(game.score);
    statusEl.textContent = statusText();
    startNextBtn.textContent = buttonLabel();
    startNextBtn.disabled = playback || (game.status === "input");
    setPadsEnabled(!playback && game.status === "input");
    for (const pad of pads) {
      pad.classList.toggle("active", pad.dataset.color === activeColor);
    }
  }

  function playSequence(sequence) {
    playback = true;
    clearHighlight();
    render();

    sequence.forEach((color, index) => {
      const start = 250 + index * 520;
      window.setTimeout(() => highlight(color), start);
      window.setTimeout(() => clearHighlight(), start + 260);
    });

    const total = 250 + sequence.length * 520;
    window.setTimeout(() => {
      playback = false;
      clearHighlight();
      render();
    }, total);
  }

  function startOrNextRound() {
    if (playback) return;
    if (!["idle", "round-complete", "game-over"].includes(game.status)) return;

    if (game.status === "game-over") {
      game = createGame();
    }

    game = startRound(game);
    playSequence(game.sequence);
    render();
  }

  function onPad(color) {
    if (playback || game.status !== "input") return;
    highlight(color);
    window.setTimeout(clearHighlight, 120);
    game = inputColor(game, color);
    render();
  }

  pads.forEach((pad) => {
    pad.addEventListener("click", () => onPad(pad.dataset.color));
  });

  startNextBtn.addEventListener("click", startOrNextRound);
  restartBtn.addEventListener("click", () => {
    game = createGame();
    playback = false;
    clearHighlight();
    render();
  });

  window.addEventListener("keydown", (event) => {
    const keyMap = {
      g: "green",
      r: "red",
      y: "yellow",
      b: "blue",
    };
    const color = keyMap[event.key.toLowerCase()];
    if (!color) return;
    onPad(color);
  });

  render();
})();
