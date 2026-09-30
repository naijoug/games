/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.NonogramCore,
    levels = window.NonogramLevels;
  const $ = (id) => document.getElementById(id);
  const key = "mini-games:nonogram:progress:v1";
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
  $("board-slot").append($("board"));
  let tool = 1;
  function onCell(i) {
    state = C.setCell(state, i, tool);
    hint = null;
    render();
  }
  function render() {
    grid(5, 5, (b, i) => {
      b.textContent = state.cells[i] === 0 ? "×" : "";
      if (state.cells[i] === 1) b.classList.add("filled");
      if (hint && (hint.index === i || hint.indices?.includes(i)))
        b.classList.add("hint");
      b.oncontextmenu = (e) => {
        e.preventDefault();
        state = C.setCell(state, i, 0);
        render();
      };
    });
    const l = state.level;
    $("col-clues").replaceChildren();
    l.colClues.forEach((clue, i) => {
      const s = document.createElement("span");
      s.textContent = clue.join(" · ");
      s.setAttribute(
        "aria-label",
        "第 " + (i + 1) + " 列线索 " + clue.join("、"),
      );
      $("col-clues").append(s);
    });
    $("row-clues").replaceChildren();
    l.rowClues.forEach((clue, i) => {
      const s = document.createElement("span");
      s.textContent = clue.join(" ");
      s.setAttribute(
        "aria-label",
        "第 " + (i + 1) + " 行线索 " + clue.join("、"),
      );
      $("row-clues").append(s);
    });
    $("controls").replaceChildren();
    for (const [v, t] of [
      [1, "涂格"],
      [0, "标空"],
      [-1, "擦除"],
    ]) {
      const b = button(t, () => {
        tool = v;
        render();
      });
      if (tool === v) b.classList.add("selected");
      $("controls").append(b);
    }
    finish();
  }
  function showHint() {
    say(hint?.text || "目前没有可以直接确定的格子，检查已有标记或试着撤销。");
  }
  reset();
})();
