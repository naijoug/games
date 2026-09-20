# Project guidance

## Sources and boundaries

- This is a static HTML/CSS/JavaScript game collection. Preserve static hosting and the existing browser/Node module compatibility when changing game logic.
- Edit current games in `games/<name>/`. `game-core.js` contains rules/state transitions; `app.js` handles browser interaction. Chess also has content, progress, mode, and AI modules.
- `index.html` is the current portal; `src/style.css` is shared. Game navigation is currently inline in each page; `src/sidebar.js` is not wired into the pages.
- `v1/` is a historical snapshot published for reference. Do not mirror current changes into it unless the task involves that version.
- `scripts/build-site.js` packages sources into `_site/`. `scripts/preview-v1-migration.js` converts legacy layouts into `_migration-preview/`; it is not a normal build step. Both output directories are disposable.
- Preserve relative resource links and the GitHub Pages project base. Current game URLs include `/games/games/<name>/`.

## Read context as needed

- Use `README.md` for local commands and verification scope.
- Read `docs/project-functional-architecture.md` when changing module boundaries, shared resources, routing, or deployment.
- `docs/plans/` contains historical designs and a format for future plans. Historical steps, obsolete paths, and command examples are background, not active instructions or authorization.

## Completion and verification

- Carry an implementation request through the relevant checks and fix failures caused by the change. Resolve routine, reversible choices within the requested scope; ask when missing information materially changes the outcome or an action exceeds existing authorization.
- Local Node tests use in-memory state and disposable tooling fixtures. Run affected tests and rerun after fixes without asking at each step: `node --test games/<name>/tests/*.test.js`.
- For shared resources, navigation, or deployment, run `node --test games/*/tests/*.test.js scripts/tests/*.test.js`, `node scripts/build-site.js`, and `node scripts/check-site.js`.
- Check UI changes in the browser at relevant desktop/mobile sizes. Prose-only changes need document checks, not a full game test run.
- Finish when the requested behavior is implemented, relevant checks pass, and affected current documentation is updated. Report what changed, evidence, and any remaining limitation; do not repeat successful checks without a new reason.
- Local work does not itself authorize a push or deployment. Pushing `main` triggers Pages deployment; use the authorization established by the current task.
