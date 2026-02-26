const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const htmlPath = path.join(__dirname, "..", "index.html");

test("chess page references local chess.js vendor script", () => {
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.match(html, /<script\s+src="\.\/vendor\/chess\.min\.js"><\/script>/);
});
