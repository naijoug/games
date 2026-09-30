module.exports = async (page, assert) => {
  const l = await page.evaluate(() => NonogramLevels[0]);
  await page.locator('[data-cell="5"]').click();
  await page.locator('#hint').click();
  assert.match(await page.locator('#status').innerText(), /冲突/);
  await page.locator('#undo').click();
  for (let i = 0; i < 25; i++)
    if (l.solution[i]) await page.locator(`[data-cell="${i}"]`).click();
  assert.match(await page.locator("#status").innerText(), /完成/);
  await page.locator("#undo").click();
  await page.locator("#hint").click();
  assert.equal(await page.locator(".hint").count(), 1);
  await page.locator("#level").selectOption("19");
  await page.getByRole("button", { name: "标空", exact: true }).click();
  await page.locator('[data-cell="0"]').click();
  assert.equal(await page.locator('[data-cell="0"]').innerText(), "×");
  await page.getByRole("button", { name: "擦除", exact: true }).click();
  await page.locator('[data-cell="0"]').click();
  assert.equal(await page.locator('[data-cell="0"]').innerText(), "");
};
