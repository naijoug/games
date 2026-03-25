/* global HangmanCore */
(function () {
  const { createGame, guessLetter } = HangmanCore;
  const statusEl = document.getElementById("status");
  const remainingEl = document.getElementById("remaining");
  const wrongEl = document.getElementById("wrong");
  const maskEl = document.getElementById("mask");
  const hintEl = document.getElementById("result-hint");
  const keyboardEl = document.getElementById("keyboard");
  const restartBtn = document.getElementById("restart");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  let game = createGame();

  function statusText() {
    if (game.status === "won") return "Won";
    if (game.status === "lost") return "Lost";
    return "Playing";
  }

  function hintText() {
    if (game.status === "won") return "You solved it.";
    if (game.status === "lost") return `Word: ${game.word}`;
    return "Type a letter or click the keyboard.";
  }

  function renderKeyboard() {
    keyboardEl.innerHTML = "";
    for (const letter of letters) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "key";
      button.textContent = letter;
      if (game.guesses.has(letter)) {
        button.classList.add("used");
        button.classList.add(game.word.includes(letter) ? "correct" : "wrong");
      }
      button.disabled = game.status !== "playing" || game.guesses.has(letter);
      button.addEventListener("click", () => {
        game = guessLetter(game, letter);
        render();
      });
      keyboardEl.appendChild(button);
    }
  }

  function render() {
    statusEl.textContent = statusText();
    remainingEl.textContent = String(game.remaining);
    wrongEl.textContent = game.wrongGuesses.length > 0 ? game.wrongGuesses.join(" ") : "-";
    maskEl.textContent = game.mask.split("").join(" ");
    hintEl.textContent = hintText();
    renderKeyboard();
  }

  window.addEventListener("keydown", (event) => {
    if (event.key.length !== 1) return;
    const letter = event.key.toUpperCase();
    if (!/^[A-Z]$/.test(letter)) return;
    game = guessLetter(game, letter);
    render();
  });

  restartBtn.addEventListener("click", () => {
    game = createGame();
    render();
  });

  render();
})();
