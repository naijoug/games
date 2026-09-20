const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildSite } = require('../build-site.js');
const { checkSite } = require('../check-site.js');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'games-site-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file, content) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  write('index.html', '<a href="./games/example/">Play</a>');
  write('src/style.css', 'body { margin: 0; }');
  write('games/example/index.html', '<link href="../../src/style.css"><script src="./app.js"></script>');
  write('games/example/app.js', '/* current game */');
  write('games/example/tests/game.test.js', '/* development only */');
  write('games/example/design.pen', 'design');
  write('v1/index.html', '<a href="./games/example/">Legacy</a>');
  write('v1/games/example/index.html', '<script src="./app.js"></script>');
  write('v1/games/example/app.js', '/* legacy game */');
  write('README.md', '[Play](https://naijoug.github.io/games/games/example/)');
  return { root, write, readmePath: path.join(root, 'README.md') };
}

test('packaging preserves current and legacy sources, excludes development files, and removes stale output', (t) => {
  const { root, write, readmePath } = fixture(t);
  write('_site/stale.html', 'old output');
  const output = buildSite(root);
  assert.equal(fs.readFileSync(path.join(output, 'games/example/app.js'), 'utf8'), '/* current game */');
  assert.equal(fs.readFileSync(path.join(output, 'v1/games/example/app.js'), 'utf8'), '/* legacy game */');
  assert.equal(fs.readFileSync(path.join(root, 'games/example/app.js'), 'utf8'), '/* current game */');
  assert.equal(fs.existsSync(path.join(output, 'games/example/tests')), false);
  assert.equal(fs.existsSync(path.join(output, 'games/example/design.pen')), false);
  assert.equal(fs.existsSync(path.join(output, 'stale.html')), false);
  assert.deepEqual(checkSite(output, { readmePath }).errors, []);
  assert.deepEqual(checkSite(output, { baseUrl: 'https://naijoug.github.io/' }).errors, []);
});

test('published route checks reject old flattened README URLs and missing catalog entries', (t) => {
  const { root, write, readmePath } = fixture(t);
  write('README.md', '[Play](https://naijoug.github.io/games/example/)');
  const result = checkSite(buildSite(root), { readmePath });
  assert.ok(result.errors.some((error) => error.includes('README.md: missing target')));
  assert.ok(result.errors.some((error) => error.includes('missing the published route for example')));
});

test('checks catch missing assets, project-base escapes, and broken legacy navigation', (t) => {
  const { root, write } = fixture(t);
  write('games/example/index.html', '<script src="./missing.js"></script><link href="/src/style.css"><a href="../">Home</a>');
  write('v1/index.html', '<a href="./example/">Legacy</a>');
  const result = checkSite(buildSite(root));
  assert.ok(result.errors.some((error) => error.includes('missing.js')));
  assert.ok(result.errors.some((error) => error.includes('escapes the site base path')));
  assert.ok(result.errors.some((error) => error.includes('games/example/index.html: missing target for ../')));
  assert.ok(result.errors.some((error) => error.includes('v1/index.html: missing target')));
});

test('every current game must have a page and a homepage entry', (t) => {
  const { root, write } = fixture(t);
  write('games/unlisted/app.js', '/* unfinished game */');
  const result = checkSite(buildSite(root));
  assert.ok(result.errors.some((error) => error.includes('Game unlisted: missing target')));
  assert.ok(result.errors.some((error) => error.includes('Homepage is missing an entry for unlisted')));
});

test('legacy conversion writes a separate preview and preserves current game sources', (t) => {
  const { root, write } = fixture(t);
  write('v1/games/example/index.html', '<html><body><main>Legacy board</main><script src="./app.js"></script></body></html>');
  write('v1/games/example/styles.css', '/* legacy styles */');
  write('scripts/preview-v1-migration.js', fs.readFileSync(path.join(__dirname, '../preview-v1-migration.js'), 'utf8'));
  const currentHtml = fs.readFileSync(path.join(root, 'games/example/index.html'), 'utf8');
  execFileSync(process.execPath, [path.join(root, 'scripts/preview-v1-migration.js')]);
  assert.equal(fs.readFileSync(path.join(root, 'games/example/index.html'), 'utf8'), currentHtml);
  assert.equal(fs.readFileSync(path.join(root, 'games/example/app.js'), 'utf8'), '/* current game */');
  assert.equal(fs.readFileSync(path.join(root, '_migration-preview/games/example/app.js'), 'utf8'), '/* legacy game */');
  assert.match(fs.readFileSync(path.join(root, '_migration-preview/games/example/index.html'), 'utf8'), /Legacy board/);
  assert.deepEqual(checkSite(path.join(root, '_migration-preview')).errors, []);
});
