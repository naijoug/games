# 2048 Mini Game

This repository deploys a static 2048 mini game from the `2048/` folder using GitHub Pages.

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
4. The workflow `.github/workflows/deploy-2048-pages.yml` deploys `2048/` automatically.

After the workflow succeeds, the site URL is typically:

- `https://naijoug.github.io/games/`
