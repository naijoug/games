module.exports = async (page, assert) => {
  await page.locator("#hint").click();
  assert.match(await page.locator("#status").innerText(), /每组/);
  const i = await page.evaluate(() =>
    PatternLevels[0].options.indexOf(PatternLevels[0].answerId),
  );
  await page.locator("#controls button").nth(i).click();
  assert.match(await page.locator("#status").innerText(), /完成/);
  await page.locator("#next").click();
  await page.locator("#level").selectOption("23");
};
