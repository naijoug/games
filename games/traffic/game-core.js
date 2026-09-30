(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TrafficCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function createGame(level) {
    const s = {
      level,
      vehicles: level.vehicles.map((v) => ({ ...v })),
      history: [],
      moves: 0,
      status: "playing",
    };
    const used = new Set();
    for (const v of s.vehicles) {
      if (!["h", "v"].includes(v.axis) || ![2, 3].includes(v.length))
        throw Error("Invalid vehicle");
      for (const p of cells(v)) {
        if (p < 0 || p >= 36 || used.has(p)) throw Error("Overlap");
        used.add(p);
      }
      if (
        v.x < 0 ||
        v.y < 0 ||
        v.x + (v.axis === "h" ? v.length : 1) > 6 ||
        v.y + (v.axis === "v" ? v.length : 1) > 6
      )
        throw Error("Bounds");
    }
    if (new Set(s.vehicles.map((v) => v.id)).size !== s.vehicles.length)
      throw Error("Duplicate id");
    return s;
  }
  function cells(v) {
    return Array.from(
      { length: v.length },
      (_, i) =>
        (v.y + (v.axis === "v" ? i : 0)) * 6 + v.x + (v.axis === "h" ? i : 0),
    );
  }
  function moveVehicle(s, id, delta) {
    if (s.status === "won" || !Number.isInteger(delta) || !delta) return s;
    const index = s.vehicles.findIndex((v) => v.id === id);
    if (index < 0) return s;
    const v = s.vehicles[index],
      occupied = new Set(s.vehicles.filter((w) => w.id !== id).flatMap(cells));
    for (
      let step = Math.sign(delta);
      Math.abs(step) <= Math.abs(delta);
      step += Math.sign(delta)
    ) {
      const p = {
        ...v,
        x: v.x + (v.axis === "h" ? step : 0),
        y: v.y + (v.axis === "v" ? step : 0),
      };
      if (
        p.x < 0 ||
        p.y < 0 ||
        p.x + (p.axis === "h" ? p.length : 1) > 6 ||
        p.y + (p.axis === "v" ? p.length : 1) > 6 ||
        cells(p).some((c) => occupied.has(c))
      )
        return s;
    }
    const vehicles = s.vehicles.map((w, i) =>
      i === index
        ? {
            ...w,
            x: w.x + (w.axis === "h" ? delta : 0),
            y: w.y + (w.axis === "v" ? delta : 0),
          }
        : w,
    );
    const target = vehicles.find((w) => w.id === s.level.targetId);
    return {
      ...s,
      vehicles,
      moves: s.moves + 1,
      history: [...s.history, s.vehicles],
      status:
        target.axis === "h" &&
        target.x + target.length === 6 &&
        target.y === s.level.exitRow
          ? "won"
          : "playing",
    };
  }
  function getLegalMoves(s) {
    const out = [];
    for (const v of s.vehicles)
      for (let d = -5; d <= 5; d++) {
        const n = moveVehicle(s, v.id, d);
        if (n !== s) out.push({ id: v.id, delta: d });
      }
    return out;
  }
  function undo(s) {
    return s.history.length
      ? {
          ...s,
          vehicles: s.history.at(-1),
          history: s.history.slice(0, -1),
          moves: s.moves - 1,
          status: "playing",
        }
      : s;
  }
  return { createGame, cells, moveVehicle, getLegalMoves, undo };
});
