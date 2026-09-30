module.exports = async (page, assert) => {
  await page.evaluate(() => {
    Math.random = () => 0.5;
  });
  await page.locator("#mode").selectOption("2");
  assert.equal(await page.locator(".card").count(), 4);
  assert.equal(await page.getByRole("button", { name: /未翻开的/ }).count(), 4);
  const deck = await page.evaluate(
    () => MemoryCore.createGame({ pairCount: 2, randomFn: () => 0.5 }).cards,
  );
  for (const value of [...new Set(deck.map((c) => c.value))])
    for (const card of deck.filter((c) => c.value === value))
      await page.locator(`[data-card="${card.id}"]`).click();
  assert.match(await page.locator("#status").innerText(), /完成/);
  await page.locator("#restart").click();
  const a = deck[0].id,
    b = deck.find((c) => c.value !== deck[0].value).id;
  await page.locator(`[data-card="${a}"]`).click();
  await page.locator(`[data-card="${b}"]`).click();
  await page.waitForTimeout(350);
  await page.locator("#restart").click();
  await page.locator(`[data-card="${a}"]`).click();
  await page.locator(`[data-card="${b}"]`).click();
  await page.waitForTimeout(900);
  assert.equal(await page.locator(".card.up").count(), 2);
  await page.waitForTimeout(400);
  assert.equal(await page.locator(".card.up").count(), 0);
  await page.locator("#mode").selectOption("6");
  assert.equal(await page.locator(".card").count(), 12);
};
