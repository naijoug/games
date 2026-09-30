module.exports = async (page, assert, width) => {
  await page.clock.install();
  await page.evaluate(() => {
    Math.random = () => 0;
  });
  await page.locator("#mode").selectOption("kids");
  await page.locator("#start-next").click();
  await page.keyboard.press("g");
  assert.match(await page.locator("#status").innerText(), /仔细看/);
  await page.clock.runFor(1260);
  await page.locator('[data-color="blue"]').click();
  assert.match(await page.locator("#status").innerText(), /重试/);
  await page.locator("#start-next").click();
  await page.clock.runFor(1260);
  await page.locator('[data-color="green"]').click();
  assert.match(await page.locator("#status").innerText(), /这一轮/);
  if (width === 390) {
    for (let round = 2; round <= 6; round++) {
      await page.locator("#start-next").click();
      await page.clock.runFor(260 + round * 1000);
      for (let i = 0; i < round; i++) await page.keyboard.press("g");
    }
    assert.match(await page.locator("#status").innerText(), /完成啦/);
  }
  await page.locator("#restart").click();
  await page.locator("#start-next").click();
  await page.clock.runFor(350);
  await page.locator("#restart").click();
  await page.clock.runFor(4000);
  assert.equal(await page.locator(".pad.active").count(), 0);
  assert.match(await page.locator("#status").innerText(), /点击开始/);
};
