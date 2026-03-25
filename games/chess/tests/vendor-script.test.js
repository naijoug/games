const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("vendored chess.js is non-ESM build compatible with classic script tag", () => {
  const vendorPath = path.join(__dirname, "..", "vendor", "chess.min.js");
  const source = fs.readFileSync(vendorPath, "utf8");

  assert.equal(/export\s*\{/.test(source), false, "vendor build must not contain ESM export syntax");
  assert.match(source, /exports\.Chess\s*=\s*Chess/, "vendor build should expose Chess in CommonJS environments");
});
