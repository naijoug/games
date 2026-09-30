/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.PipeCore,
    levels = window.PipeLevels;
  const $ = (id) => document.getElementById(id);
  const key = "mini-games:pipes:progress:v1";
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
    wet = [];
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
  let wet = [];
  function onCell(i) {
    epoch++;
    wet = [];
    state = C.rotateCell(state, i);
    hint = null;
    render();
  }
  function render() {
    const n = state.level.size;
    grid(n, n, (b, i) => {
      const m = C.mask(state.cells[i]);
      if (!m) {
        b.disabled = true;
        return;
      }
      const ports = [
        [20, 0],
        [40, 20],
        [20, 40],
        [0, 20],
      ];
      let lines = "";
      ports.forEach(([x, y], d) => {
        if (m & (1 << d)) lines += `<path d="M20 20 L${x} ${y}"/>`;
      });
      b.innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true"><g stroke="${wet.includes(i) ? "#74d5fa" : "#b7d9c7"}" stroke-width="7" fill="none">${lines}</g>${i === state.level.source || i === state.level.goal ? '<circle cx="20" cy="20" r="10" fill="#1e382b"/><text x="20" y="24" text-anchor="middle" font-size="12" fill="white">' + (i === state.level.source ? "水" : "花") + "</text>" : ""}</svg>`;
      b.setAttribute(
        "aria-label",
        i === state.level.source
          ? "水源"
          : i === state.level.goal
            ? "花园"
            : `管道 ${i + 1}，点击旋转`,
      );
      if (hint?.index === i) b.classList.add("hint");
    });
    finish();
  }
  function showHint() {
    say(hint?.text || "已经接通，可以放水了！");
  }
  $("controls").append(
    button("放水", () => {
      const token = ++epoch;
      wet = [];
      const t = C.traceWater(state);
      let at = 0;
      say("看看水流到了哪里……");
      function step() {
        if (token !== epoch) return;
        wet = t.path.slice(0, ++at);
        render();
        if (
          at < t.path.length &&
          !matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          setTimeout(step, 100);
        else {
          wet = t.path;
          state = C.checkAnswer(state);
          say(t.won ? "" : "还有开口漏水，点提示看看哪里没接好。");
          render();
        }
      }
      step();
    }),
  );
  const originalReset = $("restart").onclick;
  $("restart").onclick = () => {
    wet = [];
    originalReset();
  };
  const oldUndo = $("undo").onclick;
  $("undo").onclick = () => {
    wet = [];
    oldUndo();
  };
  $("level").addEventListener("change", () => {
    wet = [];
    render();
  });
  reset();
})();
