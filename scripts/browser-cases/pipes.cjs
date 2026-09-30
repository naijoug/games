module.exports = async (page, assert) => {
  const l = await page.evaluate(() => PipeLevels[0]);
  for (let i = 0; i < l.cells.length; i++)
    if (!l.cells[i].locked && l.cells[i].mask)
      for (let k = 0; k < (4 - l.cells[i].rotation) % 4; k++)
        await page.locator(`[data-cell="${i}"]`).click();
  await page.getByRole("button", { name: "放水", exact: true }).click();
  await page.waitForFunction(() =>
    document.querySelector("#status").textContent.includes("完成"),
  );
  await page.locator("#restart").click();
  await page.getByRole("button", { name: "放水", exact: true }).click();
  await page.locator("#restart").click();
  await page.locator("#hint").click();
  assert.equal(await page.locator(".hint").count(), 1);
};
