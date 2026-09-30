const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE_PATH || "playwright",
);
const path = require("node:path");
const fs = require("fs");
const assert = require("assert/strict");
const base = (process.env.KIDS_BASE_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);
const screenshots =
  process.env.KIDS_SCREENSHOT_DIR ||
  path.join(require("node:os").tmpdir(), "kids-game-screenshots");
(async () => {
  const slugs = process.argv.slice(2);
  if (!slugs.length)
    slugs.push(
      "maze",
      "patterns",
      "sudoku",
      "tangram",
      "traffic",
      "symmetry",
      "make-ten",
      "pipes",
      "robot",
      "nonogram",
      "memory",
      "simon",
      "sokoban",
    );
  fs.mkdirSync(screenshots, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const slug of slugs) {
      for (const width of [1440, 390, 320]) {
        const context = await browser.newContext({
          viewport: { width, height: width === 1440 ? 900 : 844 },
          hasTouch: width < 500,
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(`${base}/games/${slug}/`);
        await page.locator("h1").waitFor();
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${slug} overflow ${width}`,
        );
        if (slug === "maze") {
          const path = await page.evaluate(() => MazeLevels[0].solution);
          for (const d of path)
            await page.keyboard.press(
              {
                up: "ArrowUp",
                down: "ArrowDown",
                left: "ArrowLeft",
                right: "ArrowRight",
              }[d],
            );
          assert.match(await page.locator("#status").innerText(), /完成/);
          await page.locator("#undo").click();
          await page.locator("#hint").click();
          assert.equal(await page.locator(".hint").count(), 1);
          await page.locator("#restart").click();
          await page.locator("#level").selectOption("17");
          await page.locator("#hint").click();
        }
        const scenario = path.join(__dirname, "browser-cases", slug + ".cjs");
        if (fs.existsSync(scenario))
          await require(scenario)(page, assert, width);
        await page.screenshot({
          path: path.join(screenshots, `${slug}-${width}.png`),
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${slug} final state overflow ${width}`,
        );
        if (width < 500) await page.locator("#restart,#reset").first().tap();
        await page
          .getByRole("link", { name: "← 游戏大厅", exact: true })
          .last()
          .click();
        assert(
          await page.locator(`a[href="./games/${slug}/index.html"]`).count(),
        );
        await page.locator(`a[href="./games/${slug}/index.html"]`).click();
        await page.locator("h1").waitFor();
        assert.deepEqual(errors, []);
        await context.close();
      }
      const context = await browser.newContext();
      await context.addInitScript(() =>
        Object.defineProperty(window, "localStorage", {
          get() {
            throw Error("blocked");
          },
        }),
      );
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/games/${slug}/`);
      await page.locator("h1").waitFor();
      assert.deepEqual(errors, []);
      await context.close();
      const corrupt = await browser.newContext();
      await corrupt.addInitScript(() => {
        for (const key of [
          "maze",
          "patterns",
          "sudoku",
          "tangram",
          "traffic",
          "symmetry",
          "make-ten",
          "pipes",
          "robot",
          "nonogram",
        ])
          localStorage.setItem(`mini-games:${key}:progress:v1`, "{broken");
        for (const key of ["memory", "simon", "sokoban"])
          localStorage.setItem(`mini-games:${key}:kids:v1`, "{broken");
      });
      const corruptPage = await corrupt.newPage();
      const corruptErrors = [];
      corruptPage.on("pageerror", (e) => corruptErrors.push(e.message));
      await corruptPage.goto(`${base}/games/${slug}/`);
      await corruptPage.locator("h1").waitFor();
      assert.deepEqual(corruptErrors, []);
      await corrupt.close();
      console.log(
        `${slug}: desktop/mobile/narrow interactions, touch, navigation, layout and blocked/corrupt storage passed`,
      );
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
