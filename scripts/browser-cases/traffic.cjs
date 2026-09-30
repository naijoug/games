module.exports = async (page, assert, width) => {
  await page.locator("#hint").click();
  await page.waitForFunction(() =>
    document.querySelector("#status").textContent.includes("试着"),
  );
  const l = await page.evaluate(() => TrafficLevels[0]);
  for (const m of l.solution) {
    await page
      .getByRole("button", { name: m.id === "A" ? "★ A" : m.id, exact: true })
      .click();
    const v = l.vehicles.find((v) => v.id === m.id),
      label =
        v.axis === "h"
          ? m.delta > 0
            ? "→ 右移"
            : "← 左移"
          : m.delta > 0
            ? "↓ 下移"
            : "↑ 上移";
    for (let k = 0; k < Math.abs(m.delta); k++)
      await page.getByRole("button", { name: label, exact: true }).click();
  }
  assert.match(await page.locator("#status").innerText(), /完成/);
  await page.locator("#undo").click();
  await page.locator("#hint").click();
  await page.locator("#restart").click();
  await page.locator("#level").selectOption("17");
};
