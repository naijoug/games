module.exports = async (page, assert, width) => {
  await page.locator("#hint").click();
  assert.match(await page.locator("#status").innerText(), /参考/);
  if (width === 390) {
    const sol = await page.evaluate(() => TangramLevels[0].solution);
    for (let i = 0; i < 7; i++) {
      await page
        .getByRole("button", { name: `图块 ${i + 1}`, exact: true })
        .click();
      await page.evaluate(
        ({ i, p }) => {
          const click = (t) =>
            [...document.querySelectorAll("#controls button")]
              .find((b) => b.textContent === t)
              .click();
          let x = 1 + (i % 4) * 4,
            y = 12 + Math.floor(i / 4) * 4;
          while (x < 8) {
            click("→");
            x++;
          }
          while (x > 8) {
            click("←");
            x--;
          }
          for (let r = 0; r < p.rotation; r++) click("旋转");
          if (p.flipped) click("翻面");
          while (x < p.x) {
            click("→");
            x++;
          }
          while (x > p.x) {
            click("←");
            x--;
          }
          while (y < p.y) {
            click("↓");
            y++;
          }
          while (y > p.y) {
            click("↑");
            y--;
          }
        },
        { i, p: sol[i] },
      );
    }
    assert.match(await page.locator("#status").innerText(), /完成/);
    await page.locator("#undo").click();
    assert.match(await page.locator("#status").innerText(), /撤销/);
  }
  await page.locator("#restart").click();
  const poly = page.locator('[data-piece="0"]');
  const box = await poly.boundingBox();
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 28, box.y + 10);
  await page.mouse.up();
  await page.locator("#hint").click();
};
