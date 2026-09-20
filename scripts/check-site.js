const fs = require('node:fs');
const path = require('node:path');

const SITE_URL = 'https://naijoug.github.io/games/';

function checkSite(siteDir, { readmePath, baseUrl = SITE_URL } = {}) {
  const errors = [];
  const pages = [];
  const base = new URL(baseUrl);
  const root = path.resolve(siteDir);

  function collectPages(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) collectPages(file);
      else if (entry.name.endsWith('.html')) pages.push(file);
    }
  }

  // Check static quoted href/src attributes, not runtime JavaScript or remote availability.
  function references(html) {
    return [...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)]
      .map((match) => match[1].replace(/&amp;/g, '&'));
  }

  function checkReference(reference, pageUrl, label) {
    try {
      const url = new URL(reference, pageUrl);
      if (url.origin !== base.origin) return;
      if (!url.pathname.startsWith(base.pathname)) {
        errors.push(`${label}: ${reference} escapes the site base path ${base.pathname}`);
        return;
      }
      const relative = decodeURIComponent(url.pathname.slice(base.pathname.length));
      let target = path.resolve(root, relative);
      if (target !== root && !target.startsWith(root + path.sep)) {
        errors.push(`${label}: ${reference} escapes the artifact directory`);
        return;
      }
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
        target = path.join(target, 'index.html');
      }
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        errors.push(`${label}: missing target for ${reference}`);
      }
    } catch (error) {
      errors.push(`${label}: invalid reference ${reference} (${error.message})`);
    }
  }

  for (const required of ['index.html', 'games']) {
    if (!fs.existsSync(path.join(root, required))) errors.push(`Missing site entry: ${required}`);
  }
  if (errors.length) return { errors, pageCount: 0, gameCount: 0 };

  collectPages(root);
  for (const file of pages) {
    const relative = path.relative(root, file).split(path.sep).join('/');
    const pageUrl = new URL(relative, base);
    for (const reference of references(fs.readFileSync(file, 'utf8'))) {
      checkReference(reference, pageUrl, relative);
    }
  }

  const games = fs.readdirSync(path.join(root, 'games'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  if (!games.length) errors.push('No game directories found');
  const homeLinks = references(fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
  const canonical = (reference) => new URL(reference, base).href.replace(/index\.html$/, '');
  for (const game of games) {
    const entry = `games/${game}/index.html`;
    checkReference(entry, base, `Game ${game}`);
    if (!homeLinks.some((reference) => canonical(reference) === canonical(entry))) {
      errors.push(`Homepage is missing an entry for ${game}`);
    }
  }

  if (readmePath) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    const links = [...readme.matchAll(/https:\/\/naijoug\.github\.io\/[^\s)>"`]+/g)].map((match) => match[0]);
    for (const link of links) checkReference(link, base, 'README.md');
    for (const game of games) {
      if (!links.some((link) => canonical(link) === canonical(`games/${game}/`))) {
        errors.push(`README.md is missing the published route for ${game}`);
      }
    }
  }

  return { errors, pageCount: pages.length, gameCount: games.length };
}

if (require.main === module) {
  const rootDir = path.resolve(__dirname, '..');
  const result = checkSite(process.argv[2] || path.join(rootDir, '_site'), {
    readmePath: path.join(rootDir, 'README.md'),
  });
  if (result.errors.length) {
    console.error(result.errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Checked ${result.pageCount} HTML pages, ${result.gameCount} current games, and README routes under ${SITE_URL}`);
  }
}

module.exports = { checkSite };
