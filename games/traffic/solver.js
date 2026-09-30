(function (r, f) {
  if (typeof module === "object" && module.exports)
    module.exports = f(require("./game-core.js"));
  else r.TrafficSolver = f(r.TrafficCore);
})(globalThis, function (C) {
  function search(start, limit = 50000) {
    const queue = [{ s: { ...start, history: [] }, path: [] }],
      key = (s) => s.vehicles.map((v) => v.x + "," + v.y).join(";"),
      seen = new Set([key(start)]);
    let at = 0,
      result = null;
    return {
      step(batch = 500) {
        if (result) return result;
        for (let k = 0; k < batch && at < queue.length; k++) {
          const { s, path } = queue[at++];
          if (s.status === "won")
            return (result = { status: "solved", path, visited: seen.size });
          for (const m of C.getLegalMoves(s)) {
            const n = C.moveVehicle(s, m.id, m.delta);
            n.history = [];
            const id = key(n);
            if (seen.has(id)) continue;
            if (seen.size >= limit)
              return (result = { status: "limit", visited: seen.size });
            seen.add(id);
            queue.push({ s: n, path: [...path, m] });
          }
        }
        return at >= queue.length
          ? (result = { status: "unsolvable", visited: seen.size })
          : { status: "searching", visited: seen.size };
      },
    };
  }
  return { search };
});
