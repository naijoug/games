(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TangramGeometry = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const EPS = 1e-7;
  function area(p) {
    return (
      Math.abs(
        p.reduce((a, v, i) => {
          const w = p[(i + 1) % p.length];
          return a + v[0] * w[1] - v[1] * w[0];
        }, 0),
      ) / 2
    );
  }
  function cross(a, b, p) {
    return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  }
  function intersection(subject, clip) {
    let out = subject.map((p) => p.slice());
    const sign =
      clip.reduce((a, v, i) => {
        const w = clip[(i + 1) % clip.length];
        return a + v[0] * w[1] - v[1] * w[0];
      }, 0) >= 0
        ? 1
        : -1;
    for (let i = 0; i < clip.length; i++) {
      const a = clip[i],
        b = clip[(i + 1) % clip.length],
        input = out;
      out = [];
      if (!input.length) break;
      for (let j = 0; j < input.length; j++) {
        const p = input[j],
          q = input[(j + 1) % input.length],
          cp = sign * cross(a, b, p),
          cq = sign * cross(a, b, q);
        if (cp >= -EPS) out.push(p);
        if (cp >= -EPS !== cq >= -EPS) {
          const t = cp / (cp - cq);
          out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
        }
      }
    }
    return out;
  }
  function transform(shape, p) {
    const angle = ((p.rotation % 4) + 4) % 4;
    return shape.map(([a, b]) => {
      let x = p.flipped ? -a : a,
        y = b;
      for (let i = 0; i < angle; i++) [x, y] = [-y, x];
      return [x + p.x, y + p.y];
    });
  }
  function covered(polys, target) {
    for (let i = 0; i < polys.length; i++) {
      const ar = area(polys[i]);
      if (
        Math.abs(
          target.reduce((sum, t) => sum + area(intersection(polys[i], t)), 0) -
            ar,
        ) > EPS
      )
        return false;
      for (let j = 0; j < i; j++)
        if (area(intersection(polys[i], polys[j])) > EPS) return false;
    }
    return (
      Math.abs(
        polys.reduce((s, p) => s + area(p), 0) -
          target.reduce((s, p) => s + area(p), 0),
      ) < EPS
    );
  }
  return { area, intersection, transform, covered, EPS, cross };
});
