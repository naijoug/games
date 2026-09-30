/* global SimonCore */
(() => {
  const C = SimonCore,
    $ = (id) => document.getElementById(id),
    key = "mini-games:simon:kids:v1",
    symbols = ["●", "▲", "■", "★"],
    colors = ["#52ab7b", "#d67473", "#dfbd65", "#739bd9"];
  let mode = "classic",
    game,
    epoch = 0,
    timers = new Set(),
    playback = false,
    active = null;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved?.version === 1 && ["classic", "kids"].includes(saved.mode))
      mode = saved.mode;
  } catch (_) {}
  function cancel() {
    epoch++;
    for (const t of timers) clearTimeout(t);
    timers.clear();
    active = null;
    playback = false;
  }
  function later(fn, ms) {
    const token = epoch;
    const t = setTimeout(() => {
      timers.delete(t);
      if (token === epoch) fn();
    }, ms);
    timers.add(t);
  }
  function reset() {
    cancel();
    game = C.createGame({ mode });
    $("mode").value = mode;
    try {
      localStorage.setItem(key, JSON.stringify({ version: 1, mode }));
    } catch (_) {}
    render();
  }
  function render() {
    const texts = {
      idle: "点击开始，先观察。",
      input: "轮到你了，按刚才的顺序。",
      "round-complete": "这一轮完成啦！点击下一轮。",
      "game-over": "这次顺序不同，点击开始可以再挑战。",
      retry: "没关系，点击重试，再看同一组顺序。",
      won: "完成啦！你记住了 6 个信号。",
    };
    $("status").textContent = playback
      ? "仔细看，播放结束后再点击。"
      : texts[game.status];
    $("progress").textContent =
      "长度 " + game.sequence.length + " · 已完成 " + game.score;
    $("start-next").textContent =
      game.status === "round-complete"
        ? "下一轮"
        : game.status === "retry"
          ? "重试"
          : "开始";
    $("start-next").disabled =
      playback || ["input", "won"].includes(game.status);
    $("replay").hidden = mode !== "kids";
    $("replay").disabled =
      playback || !["input", "retry"].includes(game.status);
    for (const b of $("board").children) {
      b.disabled = playback || game.status !== "input";
      b.classList.toggle("active", b.dataset.color === active);
    }
  }
  function play() {
    cancel();
    playback = true;
    const beat = mode === "kids" ? 1000 : 520,
      lit = mode === "kids" ? 650 : 260;
    game.sequence.forEach((color, i) => {
      later(
        () => {
          active = color;
          render();
        },
        250 + i * beat,
      );
      later(
        () => {
          active = null;
          render();
        },
        250 + i * beat + lit,
      );
    });
    later(
      () => {
        playback = false;
        active = null;
        render();
      },
      250 + game.sequence.length * beat,
    );
    render();
  }
  function input(color) {
    if (playback || game.status !== "input") return;
    game = C.inputColor(game, color);
    active = color;
    render();
    later(() => {
      active = null;
      render();
    }, 120);
  }
  $("board").style.setProperty("--cols", 2);
  C.COLORS.forEach((color, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cell pad";
    b.dataset.color = color;
    b.textContent = symbols[i];
    b.style.background = colors[i];
    b.style.color = "#15291f";
    b.setAttribute(
      "aria-label",
      symbols[i] + " " + ["绿色圆形", "红色三角", "黄色方形", "蓝色星形"][i],
    );
    b.onclick = () => input(color);
    $("board").append(b);
  });
  $("start-next").onclick = () => {
    if (playback) return;
    if (game.status === "game-over") game = C.createGame({ mode });
    if (game.status === "retry") game = C.replayRound(game);
    else game = C.startRound(game);
    play();
  };
  $("replay").onclick = () => {
    if (playback) return;
    game = C.replayRound(game);
    play();
  };
  $("restart").onclick = reset;
  $("mode").onchange = () => {
    mode = $("mode").value;
    reset();
  };
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "SELECT") return;
    const c = { g: "green", r: "red", y: "yellow", b: "blue" }[
      e.key.toLowerCase()
    ];
    if (c) input(c);
  });
  reset();
})();
