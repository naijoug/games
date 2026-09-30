module.exports = async (page, assert) => {
  await page.locator("#mode").selectOption("kids");
  assert.equal(await page.locator("#level option").count(), 12);
  await page.keyboard.press("ArrowRight");
  assert.match(await page.locator("#status").innerText(), /完成/);
  await page.locator("#undo").click();
  assert.match(await page.locator("#status").innerText(), /撤销/);
  await page.locator("#hint").click();
  await page.waitForFunction(() =>
    document.querySelector("#status").textContent.includes("下一步"),
  );
  assert.equal(await page.locator(".hint").count(), 1);
  await page.locator("#level").selectOption("11");
  const solution = await page.evaluate(() => SokobanKidsLevels[11].solution);
  for (const d of solution)
    await page.keyboard.press(
      {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
      }[d],
    );
  assert.match(await page.locator("#status").innerText(), /完成/);
  await page.locator("#reset").click();
  await page.locator("#hint").click();
  await page.locator("#mode").selectOption("classic");
  assert.equal(await page.locator("#level option").count(), 3);
  await page.locator("#mode").selectOption("kids");
  await page.locator("#level").selectOption("11");
};
