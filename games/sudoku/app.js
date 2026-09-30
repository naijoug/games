/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.SudokuCore,
    levels = window.SudokuLevels;
  const $ = (id) => document.getElementById(id);
  const key = "mini-games:sudoku:progress:v1";
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
          numbers,
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
  let selected = 0,
    numbers = saved.numbers === true;
  function onCell(i) {
    selected = i;
    render();
  }
  function input(v) {
    state = C.setCell(state, selected, v);
    hint = null;
    render();
  }
  function render() {
    const bad = C.conflicts(state.cells);
    grid(4, 4, (b, i) => {
      const v = state.cells[i];
      b.textContent = v
        ? numbers
          ? String(v)
          : ["", "兔", "猫", "鱼", "鸟"][v]
        : "";
      if (state.level.givens[i]) b.classList.add("given");
      if (i === selected) b.classList.add("selected");
      if (bad.includes(i)) b.classList.add("conflict");
      if (hint?.index === i) b.classList.add("hint");
      if (i % 4 === 1) b.style.borderRight = "4px solid #a5d9c0";
      if (Math.floor(i / 4) === 1) b.style.borderBottom = "4px solid #a5d9c0";
    });
    $("controls").replaceChildren();
    for (let v = 1; v <= 4; v++)
      $("controls").append(
        button(numbers ? String(v) : ["", "兔", "猫", "鱼", "鸟"][v], () =>
          input(v),
        ),
      );
    $("controls").append(
      button("清除", () => input(0)),
      button(numbers ? "切换动物" : "切换数字", () => {
        numbers = !numbers;
        persist();
        render();
      }),
    );
    if (bad.length) say("有重复的图案，请检查标出的格子。");
    finish();
  }
  function showHint() {
    if (hint) {
      selected = hint.index;
      say(
        hint.text +
          (hint.value
            ? " 可填：" +
              (numbers ? hint.value : ["", "兔", "猫", "鱼", "鸟"][hint.value])
            : ""),
      );
    } else say("已经填好啦。");
  }
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "SELECT") return;
    if (/^[1-4]$/.test(e.key)) input(Number(e.key));
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      input(0);
    }
  });
  reset();
})();
