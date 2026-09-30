/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.RobotCore,
    levels = window.RobotLevels;
  const $ = (id) => document.getElementById(id);
  const key = "mini-games:robot:progress:v1";
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
  let program = [],
    selected = -1,
    child = -1,
    editing = false,
    lastLevel = null;
  const names = { forward: "前进", left: "左转", right: "右转" };
  $("undo").hidden = true;
  function onCell() {}
  function changed() {
    epoch++;
    state = C.createGame(levels[levelIndex]);
    hint = null;
    say("程序已修改，机器人回到起点。");
    render();
  }
  function list() {
    return editing && program[selected]?.type === "repeat"
      ? program[selected].body
      : program;
  }
  function add(type) {
    list().push({ type });
    changed();
  }
  function render() {
    if (lastLevel !== state.level.id) {
      lastLevel = state.level.id;
      program = [];
      selected = -1;
      editing = false;
      child = -1;
    }
    const n = state.level.size;
    grid(n, n, (b, i) => {
      b.disabled = true;
      if (state.level.map[Math.floor(i / n)][i % n] === "#")
        b.classList.add("wall");
      if (i === state.level.goal) {
        b.textContent = "⚑";
        b.classList.add("target");
      }
      if (i === state.player) {
        b.textContent = ["↑", "→", "↓", "←"][state.direction];
        b.classList.add("player");
      }
    });
    const el = $("program");
    el.replaceChildren();
    program.forEach((node, i) => {
      const b = button(
        i +
          1 +
          ". " +
          (node.type === "repeat"
            ? "重复 " + node.count + " 次"
            : names[node.type]),
        () => {
          selected = i;
          child = -1;
          editing = false;
          render();
        },
      );
      if (i === selected) b.classList.add("selected");
      const active = state.actions[state.pc];
      if (state.status === "running" && active?.index === i)
        b.style.borderColor = "#ffd477";
      el.append(b);
      if (node.type === "repeat") {
        const sub = document.createElement("div");
        sub.className = "loop-body";
        node.body.forEach((x, j) => {
          const t = button(names[x.type], () => {
            selected = i;
            child = j;
            editing = true;
            render();
          });
          if (editing && i === selected && j === child)
            t.classList.add("selected");
          if (
            active?.index === i &&
            active.childIndex === j &&
            state.status === "running"
          )
            t.style.borderColor = "#ffd477";
          sub.append(t);
        });
        el.append(sub);
      }
    });
    $("editing").textContent = editing
      ? "正在编辑第 " + (selected + 1) + " 条循环内部"
      : "正在编辑主程序";
    $("controls").replaceChildren();
    Object.entries(names).forEach(([type, label]) =>
      $("controls").append(button("添加" + label, () => add(type))),
    );
    $("controls").append(
      button("添加重复", () => {
        if (editing) {
          say("循环内部不能再添加循环。");
          return;
        }
        program.push({ type: "repeat", count: 2, body: [{ type: "forward" }] });
        selected = program.length - 1;
        child = -1;
        changed();
      }),
      button(editing ? "回到主程序" : "编辑循环体", () => {
        if (editing) {
          editing = false;
          child = -1;
        } else if (program[selected]?.type === "repeat") editing = true;
        else {
          say("先选择一条重复指令。");
          return;
        }
        render();
      }),
      button("重复次数 +1", () => {
        const p = program[selected];
        if (p?.type === "repeat") {
          p.count = p.count === 4 ? 2 : p.count + 1;
          changed();
        }
      }),
    );
    for (const [label, delta] of [
      ["前移", -1],
      ["后移", 1],
      ["删除", 0],
    ])
      $("controls").append(
        button(label, () => {
          const a = list(),
            i = editing ? child : selected;
          if (i < 0 || i >= a.length) return;
          if (!delta) {
            a.splice(i, 1);
            if (editing) child = -1;
            else selected = -1;
          } else if (a[i + delta]) {
            [a[i], a[i + delta]] = [a[i + delta], a[i]];
            if (editing) child += delta;
            else selected += delta;
          }
          changed();
        }),
      );
    finish();
  }
  function showHint() {
    say(hint);
  }
  function step() {
    if (state.status !== "running")
      try {
        state = C.createRun(levels[levelIndex], program);
      } catch (e) {
        say(e.message);
        return false;
      }
    state = C.stepRun(state);
    if (state.error) say(state.error);
    render();
    return state.status === "running";
  }
  $("run").onclick = () => {
    const token = ++epoch;
    state = C.createGame(levels[levelIndex]);
    function tick() {
      if (token !== epoch) return;
      if (step()) setTimeout(tick, 350);
    }
    tick();
  };
  $("step").onclick = () => {
    epoch++;
    step();
  };
  $("stop").onclick = () => {
    epoch++;
    state = C.createGame(levels[levelIndex]);
    say("已停止，程序保留，可以继续修改。");
    render();
  };
  reset();
})();
