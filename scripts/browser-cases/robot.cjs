module.exports = async (page, assert, width) => {
  const p = await page.evaluate(() => RobotLevels[0].solution);
  const names = { forward: "前进", left: "左转", right: "右转" };
  for (const n of p)
    await page
      .getByRole("button", { name: "添加" + names[n.type], exact: true })
      .click();
  await page.getByRole("button", { name: "运行", exact: true }).click();
  await page.waitForFunction(() =>
    document.querySelector("#status").textContent.includes("完成"),
  );
  await page.getByRole("button", { name: "停止并复位", exact: true }).click();
  await page.getByRole("button", { name: "单步", exact: true }).click();
  await page.locator("#restart").click();
  await page.locator("#level").selectOption("12");
  await page.getByRole("button", { name: "添加重复", exact: true }).click();
  await page.getByRole("button", { name: "编辑循环体", exact: true }).click();
  await page.getByRole("button", { name: "添加右转", exact: true }).click();
  assert.equal(await page.locator(".loop-body button").count(), 2);
  await page.getByRole("button", { name: "运行", exact: true }).click();
  await page.getByRole("button", { name: "停止并复位", exact: true }).click();
  await page.getByRole("button", { name: "添加前进", exact: true }).focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page.evaluate(() => document.activeElement.textContent),
    "添加前进",
  );
};
