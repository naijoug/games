module.exports = async (page, assert) => {
  await page.getByRole("button", { name: "切换数字", exact: true }).click();
  for (let pair = 0; pair < 4; pair++) {
    const cards = await page.locator("#board .cell").evaluateAll((bs) =>
      bs
        .map((b, i) => ({
          i,
          v: Number(b.textContent),
          visible: b.style.visibility !== "hidden",
        }))
        .filter((x) => x.visible),
    );
    let found;
    for (let a = 0; a < cards.length; a++)
      for (let b = a + 1; b < cards.length; b++)
        if (cards[a].v + cards[b].v === 5) found = [cards[a].i, cards[b].i];
    assert(found);
    for (const i of found) await page.locator(`[data-cell="${i}"]`).click();
  }
  assert.match(await page.locator("#status").innerText(), /完成/);
  await page.locator("#restart").click();
  await page.locator("#level").selectOption("1");
  await page.locator("#hint").click();
  assert.equal(await page.locator(".hint").count(), 2);
};
