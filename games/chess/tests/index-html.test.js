const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const htmlPath = path.join(__dirname, "..", "index.html");

test("chess page references local chess.js vendor script", () => {
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.match(html, /<script\s+src="\.\/vendor\/chess\.min\.js"><\/script>/);
});

test("chess page includes progress-core script before app bootstrap", () => {
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.match(html, /<script\s+src="\.\/progress-core\.js"><\/script>/);
  const progressIndex = html.indexOf('<script src="./progress-core.js"></script>');
  const appIndex = html.indexOf('<script src="./app.js"></script>');
  assert.ok(progressIndex >= 0 && appIndex > progressIndex, "progress-core should load before app.js");
});
