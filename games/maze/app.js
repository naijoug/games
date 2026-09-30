/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.MazeCore,
    levels = window.MazeLevels;
  const $ = (id) => document.getElementById(id);
  const key = "mini-games:maze:progress:v1";
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(key)) || {};
  } catch (_) {}
  if (!saved || saved.version !== 1) saved = {};
  const completed = new Set(
    Array.isArray(saved.completed)
      ? saved.completed.filter((id) => levels.some((l) => l.id === id))
      : [],
  );
  let levelIndex = Math.max(
    0,
    levels.findIndex((l) => l.id === saved.last),
  );
  let state,
    hint = null,
    epoch = 0;
  function persist() {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          completed: [...completed],
          last: levels[levelIndex].id,
        }),
      );
    } catch (_) {}
  }
  function say(text) {
    $("status").textContent = text;
  }
  function button(text, fn, label) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    if (label) b.setAttribute("aria-label", label);
    b.onclick = () => {
      fn();
      if (!b.isConnected && document.activeElement === document.body) {
        const replacement = [...document.querySelectorAll("button")].find(
          (x) => x.textContent === text && !x.disabled,
        );
        replacement?.focus({ preventScroll: true });
      }
    };
    return b;
  }
  function grid(rows, cols, draw) {
    const focus = document.activeElement?.dataset?.cell;
    $("board").replaceChildren();
    $("board").style.setProperty("--cols", cols);
    for (let i = 0; i < rows * cols; i++) {
      const b = button(
        "",
        () => onCell(i),
        `第 ${Math.floor(i / cols) + 1} 行，第 ${(i % cols) + 1} 列`,
      );
      b.className = "cell";
      b.dataset.cell = i;
      draw(b, i);
      $("board").append(b);
    }
    if (focus !== undefined)
      $("board")
        .querySelector(`[data-cell="${focus}"]`)
        ?.focus({ preventScroll: true });
  }
  function finish() {
    if (state.status === "won") {
      completed.add(levels[levelIndex].id);
      persist();
      say("完成啦！你可以再玩一次，或选择下一关。");
    }
    $("progress").textContent =
      `第 ${levelIndex + 1} / ${levels.length} 关 · 已完成 ${completed.size} 关`;
  }
  function reset() {
    epoch++;
    hint = null;
    state = C.createGame(levels[levelIndex]);
    $("level").value = levelIndex;
    persist();
    say(levels[levelIndex].instruction || "慢慢观察，可以随时重开或查看提示。");
    render();
  }
  levels.forEach((l, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = `第 ${i + 1} 关`;
    $("level").append(o);
  });
  $("level").onchange = () => {
    levelIndex = Number($("level").value);
    reset();
  };
  $("restart").onclick = reset;
  $("next").onclick = () => {
    levelIndex = (levelIndex + 1) % levels.length;
    reset();
  };
  $("undo").onclick = () => {
    if (C.undo) {
      epoch++;
      state = C.undo(state);
      hint = null;
      say("已撤销。");
      render();
    }
  };
  $("hint").onclick = () => {
    hint = C.getHint?.(state);
    showHint();
    render();
  };
  function act(d) {
    state = C.move(state, d);
    hint = null;
    render();
  }
  function onCell(i) {
    for (const d of Object.keys(C.DIRS))
      if (C.nextCell(state, state.player, d) === i) act(d);
  }
  function render() {
    grid(state.rows, state.cols, (b, i) => {
      const v = state.level.map[Math.floor(i / state.cols)][i % state.cols];
      if (v === "#") {
        b.classList.add("wall");
        b.disabled = true;
        b.setAttribute("aria-label", "墙");
      }
      if (state.history.includes(i)) b.classList.add("visited");
      if (i === state.goal) {
        b.textContent = "⌂";
        b.classList.add("target");
      }
      if (i === state.player) {
        b.textContent = "兔";
        b.classList.add("player");
      }
      if (hint && C.nextCell(state, state.player, hint) === i)
        b.classList.add("hint");
    });
    finish();
  }
  function showHint() {
    say(hint ? "沿着虚线格走一步，再观察下一条路。" : "你已经到家啦。");
  }
  for (const [d, label] of Object.entries({
    up: "↑ 上",
    down: "↓ 下",
    left: "← 左",
    right: "→ 右",
  }))
    $("controls").append(button(label, () => act(d)));
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "SELECT") return;
    const d = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    }[e.key];
    if (d) {
      e.preventDefault();
      act(d);
    }
  });
  reset();
})();
