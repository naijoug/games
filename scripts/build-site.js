const fs = require('node:fs');
const path = require('node:path');

// Keep packaging separate from the historical v1 layout conversion.
function buildSite(rootDir = path.resolve(__dirname, '..')) {
  const outputDir = path.join(rootDir, '_site');
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  for (const entry of ['index.html', 'src', 'games', 'v1']) {
    fs.cpSync(path.join(rootDir, entry), path.join(outputDir, entry), {
      recursive: true,
      filter: (source) => path.basename(source) !== 'tests' && !source.endsWith('.pen'),
    });
  }
  return outputDir;
}

if (require.main === module) {
  console.log(`Site artifact written to ${buildSite()}`);
}

module.exports = { buildSite };
