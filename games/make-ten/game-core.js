(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MakeTenCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const MODES = [
    { id: "make-five", target: 5 },
    { id: "make-ten", target: 10 },
  ];
  function createGame({ target = 10, randomFn = Math.random } = {}) {
    if (![5, 10].includes(target)) throw Error("Invalid target");
    const cards = [];
    for (let i = 0; i < 4; i++) {
      const raw = randomFn();
      if (!Number.isFinite(raw) || raw < 0 || raw >= 1)
        throw Error("Invalid random value");
      const a = 1 + Math.floor(raw * (target - 1));
      cards.push({ id: 2 * i, value: a }, { id: 2 * i + 1, value: target - a });
    }
    for (let i = cards.length - 1; i > 0; i--) {
      const raw = randomFn();
      if (!Number.isFinite(raw) || raw < 0 || raw >= 1)
        throw Error("Invalid random value");
      const j = Math.floor(raw * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return {
      target,
      cards,
      selectedIds: [],
      matchedIds: [],
      attempts: 0,
      locked: false,
      status: "playing",
    };
  }
  function selectCard(s, id) {
    if (
      s.status === "won" ||
      s.locked ||
      s.matchedIds.includes(id) ||
      s.selectedIds.includes(id) ||
      !s.cards.some((c) => c.id === id)
    )
      return s;
    const selectedIds = [...s.selectedIds, id];
    if (selectedIds.length === 1) return { ...s, selectedIds };
    const sum = selectedIds.reduce(
      (a, id) => a + s.cards.find((c) => c.id === id).value,
      0,
    );
    if (sum !== s.target)
      return { ...s, selectedIds, locked: true, attempts: s.attempts + 1 };
    const matchedIds = [...s.matchedIds, ...selectedIds];
    return {
      ...s,
      selectedIds: [],
      matchedIds,
      attempts: s.attempts + 1,
      status: matchedIds.length === 8 ? "won" : "playing",
    };
  }
  function resolveAttempt(s) {
    return s.locked ? { ...s, selectedIds: [], locked: false } : s;
  }
  function getHint(s) {
    const cards = s.cards.filter((c) => !s.matchedIds.includes(c.id)),
      a = s.selectedIds.length
        ? cards.find((c) => c.id === s.selectedIds[0])
        : cards[0];
    if (!a) return null;
    const b = cards.find(
      (c) => c.id !== a.id && c.value + a.value === s.target,
    );
    return b
      ? {
          ids: [a.id, b.id],
          text:
            a.value + " 还需要 " + b.value + "，合起来是 " + s.target + "。",
        }
      : null;
  }
  return { MODES, createGame, selectCard, resolveAttempt, getHint };
});
