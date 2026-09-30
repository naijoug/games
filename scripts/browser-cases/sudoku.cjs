module.exports = async (page, assert) => {
  const l = await page.evaluate(() => SudokuLevels[0]);
  for (let i = 0; i < 16; i++)
    if (!l.givens[i]) {
      await page.locator(`[data-cell="${i}"]`).click();
      await page.keyboard.press(String(l.solution[i]));
    }
  assert.match(await page.locator("#status").innerText(), /完成/);
  await page.locator("#undo").click();
  await page.locator("#hint").click();
  assert.equal(await page.locator(".hint").count(), 1);
  await page.getByRole("button", { name: "切换数字", exact: true }).click();
  await page.locator("#restart").click();
};
