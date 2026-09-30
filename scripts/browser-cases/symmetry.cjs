module.exports = async (page, assert) => {
  const l = await page.evaluate(() => SymmetryLevels[0]);
  await page.getByRole("button", { name: "●", exact: true }).click();
  for (let i = 0; i < l.target.length; i++)
    if (!l.readonly.includes(i) && l.target[i])
      await page.locator(`[data-cell="${i}"]`).click();
  await page.getByRole("button", { name: "检查", exact: true }).click();
  assert.match(await page.locator("#status").innerText(), /完成/);
  await page.locator("#undo").click();
  await page.locator("#hint").click();
  assert.equal(await page.locator(".hint").count(), 2);
  await page.locator("#level").selectOption("17");
};
