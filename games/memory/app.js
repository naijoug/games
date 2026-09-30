/* global MemoryCore */
(() => {
  const $ = (id) => document.getElementById(id),
    key = "mini-games:memory:kids:v1",
    animals = ["兔", "猫", "鸟", "鱼", "熊", "鹿"];
  let pairCount = 8,
    game,
    timer = null,
    epoch = 0;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved?.version === 1 && [2, 4, 6, 8].includes(saved.pairCount))
      pairCount = saved.pairCount;
  } catch (_) {}
  function start() {
    clearTimeout(timer);
    timer = null;
    epoch++;
    game = MemoryCore.createGame({ pairCount });
    $("mode").value = pairCount;
    try {
      localStorage.setItem(key, JSON.stringify({ version: 1, pairCount }));
    } catch (_) {}
    render();
  }
  function label(value) {
    return pairCount === 8
      ? value
      : ["🐰", "🐱", "🐦", "🐟", "🐻", "🦌"][value.charCodeAt(0) - 65] +
          " " +
          animals[value.charCodeAt(0) - 65];
  }
  function flip(i) {
    game = MemoryCore.flipCard(game, i);
    render();
    if (game.locked && timer === null) {
      const token = epoch;
      timer = setTimeout(
        () => {
          if (token !== epoch) return;
          timer = null;
          game = MemoryCore.resolveTurn(game);
          render();
        },
        pairCount === 8 ? 500 : 1200,
      );
    }
  }
  function render() {
    const focused = document.activeElement?.dataset?.card;
    $("board").style.setProperty("--cols", pairCount === 2 ? 2 : 4);
    $("board").replaceChildren();
    game.cards.forEach((card, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cell card " + card.state;
      b.dataset.card = i;
      b.textContent = card.state === "down" ? "？" : label(card.value);
      b.setAttribute(
        "aria-label",
        card.state === "down"
          ? "未翻开的第 " + (i + 1) + " 张牌"
          : label(card.value) +
              (card.state === "matched" ? "，已配对" : "，已翻开"),
      );
      b.disabled =
        game.locked || card.state === "matched" || game.status === "won";
      if (card.state === "matched") b.classList.add("filled");
      b.onclick = () => flip(i);
      $("board").append(b);
    });
    if (focused !== undefined) {
      const b = $("board").querySelector(`[data-card="${focused}"]`);
      if (!b?.disabled) b?.focus({ preventScroll: true });
      else
        $("board")
          .querySelector("button:not(:disabled)")
          ?.focus({ preventScroll: true });
    }
    $("progress").textContent =
      "已配对 " +
      game.matchedPairs +
      " / " +
      pairCount +
      " · 尝试 " +
      game.moves +
      " 次";
    $("status").textContent =
      game.status === "won"
        ? "完成啦！所有朋友都找到同伴了。"
        : game.locked
          ? "不太一样，再记一记它们的位置。"
          : "翻开两张，找相同的图案。";
  }
  $("restart").onclick = start;
  $("mode").onchange = () => {
    pairCount = Number($("mode").value);
    start();
  };
  start();
})();
