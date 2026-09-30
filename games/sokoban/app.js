/* global SokobanCore, SokobanKidsLevels, SokobanSolver */
(() => {
  const C = SokobanCore,
    $ = (id) => document.getElementById(id),
    key = "mini-games:sokoban:kids:v1",
    names = { up: "上", down: "下", left: "左", right: "右" };
  let mode = "classic",
    index = 0,
    game,
    epoch = 0,
    hint = null,
    completed = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved?.version === 1) {
      if (["classic", "kids"].includes(saved.mode)) mode = saved.mode;
      if (Number.isInteger(saved.index))
        index = Math.max(
          0,
          Math.min((mode === "kids" ? 12 : 3) - 1, saved.index),
        );
      if (Array.isArray(saved.completed))
        completed = new Set(
          saved.completed.filter((id) =>
            SokobanKidsLevels.some((l) => l.id === id),
          ),
        );
    }
  } catch (_) {}
  function persist() {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ version: 1, mode, index, completed: [...completed] }),
      );
    } catch (_) {}
  }
  function start() {
    epoch++;
    hint = null;
    game =
      mode === "kids"
        ? C.createGameFromLevel(SokobanKidsLevels[index])
        : C.createGame(index);
    $("mode").value = mode;
    $("level").replaceChildren();
    const count = mode === "kids" ? SokobanKidsLevels.length : C.LEVELS.length;
    for (let i = 0; i < count; i++) {
      const o = document.createElement("option");
      o.value = i;
      o.textContent = "第 " + (i + 1) + " 关";
      $("level").append(o);
    }
    $("level").value = index;
    $("status").textContent =
      "把箱子送到 ◇ 目标上。方向按钮和方向键都可以移动。";
    persist();
    render();
  }
  function render() {
    $("board").style.setProperty("--cols", game.cols);
    $("board").replaceChildren();
    for (let r = 0; r < game.rows; r++)
      for (let c = 0; c < game.cols; c++) {
        const id = r + ":" + c,
          b = document.createElement("div");
        b.className = "cell";
        if (game.walls.has(id)) b.classList.add("wall");
        if (game.targets.has(id)) {
          b.textContent = "◇";
          b.classList.add("target");
        }
        if (game.boxes.has(id)) {
          b.textContent = "▣";
          b.classList.add("box");
        }
        if (game.player.row === r && game.player.col === c) {
          b.textContent = "人";
          b.classList.add("player");
        }
        if (hint) {
          const [dr, dc] = {
            up: [-1, 0],
            down: [1, 0],
            left: [0, -1],
            right: [0, 1],
          }[hint];
          if (r === game.player.row + dr && c === game.player.col + dc)
            b.classList.add("hint");
        }
        b.setAttribute(
          "aria-label",
          `第 ${r + 1} 行第 ${c + 1} 列，` +
            (game.walls.has(id)
              ? "墙"
              : game.boxes.has(id)
                ? "箱子"
                : game.player.row === r && game.player.col === c
                  ? "玩家"
                  : game.targets.has(id)
                    ? "目标"
                    : "空地"),
        );
        $("board").append(b);
      }
    $("progress").textContent =
      "步数 " +
      game.moves +
      " · 推动 " +
      game.pushes +
      (mode === "kids" ? " · 已完成 " + completed.size + " / 12" : "");
    if (game.status === "won") {
      if (mode === "kids") completed.add(SokobanKidsLevels[index].id);
      persist();
      $("status").textContent = "完成啦！所有箱子都到目标了。";
    } else if (C.cornerBoxes(game).length)
      $("status").textContent = "箱子进了非目标角落，可能出不来了；可以撤销。";
  }
  function move(d) {
    epoch++;
    hint = null;
    game = C.move(game, d);
    render();
  }
  for (const [d, label] of Object.entries(names)) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.dir = d;
    b.textContent =
      { up: "↑", down: "↓", left: "←", right: "→" }[d] + " " + label;
    b.onclick = () => move(d);
    $("controls").append(b);
  }
  $("mode").onchange = () => {
    mode = $("mode").value;
    index = 0;
    start();
  };
  $("level").onchange = () => {
    index = Number($("level").value);
    start();
  };
  $("reset").onclick = start;
  $("next").onclick = () => {
    index =
      (index + 1) %
      (mode === "kids" ? SokobanKidsLevels.length : C.LEVELS.length);
    start();
  };
  $("undo").onclick = () => {
    epoch++;
    hint = null;
    game = C.undo(game);
    $("status").textContent = "已撤销。";
    render();
  };
  $("hint").onclick = () => {
    const token = ++epoch,
      search = SokobanSolver.search(game);
    $("status").textContent = "正在观察当前局面……";
    function tick() {
      if (token !== epoch) return;
      const r = search.step();
      if (r.status === "searching") {
        setTimeout(tick, 0);
        return;
      }
      hint = r.path?.[0] || null;
      $("status").textContent = hint
        ? "下一步可以向" + names[hint] + "走。"
        : "可以先撤销几步或重新开始。";
      render();
    }
    tick();
  };
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "SELECT") return;
    const d =
      {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      }[e.key] || { W: "up", S: "down", A: "left", D: "right" }[e.key];
    if (d) {
      e.preventDefault();
      move(d);
    }
  });
  start();
})();
