# 2048 Mini Game

This repository deploys multiple static mini games using GitHub Pages.

## Local Run

Open `2048/index.html` in a browser.

## Test

```bash
node --test 2048/tests/game-core.test.js
```

## Deploy to GitHub Pages

1. Push this repository to `main`.
2. In GitHub, go to `Settings -> Pages`.
3. Under `Build and deployment`, choose `Source: GitHub Actions`.
4. The workflow `.github/workflows/deploy-2048-pages.yml` deploys a site artifact with:
- root landing page: `index.html`
- each top-level folder that contains its own `index.html` (for example `2048/`)

After the workflow succeeds, URLs are:

- Home: `https://naijoug.github.io/games/`
- 2048: `https://naijoug.github.io/games/2048/`

## Add More Games

1. Create a new top-level folder like `snake/`.
2. Put a playable page at `snake/index.html`.
3. Push to `main`.

The deploy workflow will include it automatically.
