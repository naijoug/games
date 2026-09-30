# 项目功能架构

本文描述当前实现与维护边界，最近核对日期为 2026-09-30。开发命令和按变更选择验证的方法见 [README](../README.md)，代理工作约束见 [AGENTS.md](../AGENTS.md)。

## 目录与职责

| 路径 | 职责 |
| --- | --- |
| `index.html` | 当前门户，链接到 `games/<name>/index.html` |
| `games/<name>/` | 当前维护的游戏源码 |
| `src/style.css` | 门户和当前游戏共用的终端风格样式 |
| `src/sidebar.js` | 尚未接入页面的侧栏模块；当前游戏使用 HTML 内联导航 |
| `v1/` | 历史页面和游戏快照，继续随站点发布，不与当前版本自动同步 |
| `scripts/build-site.js` | 将当前静态资源打包到 `_site/` |
| `scripts/check-site.js` | 检查打包后的静态 HTML 链接、资源与 README 游戏路由 |
| `scripts/preview-v1-migration.js` | 历史布局转换工具，单独生成 `_migration-preview/` |
| `scripts/tests/` | 构建与路径检查的回归测试 |
| `docs/plans/` | 历史设计/实施记录与未来计划格式 |
| `.github/workflows/deploy-pages.yml` | PR 验证，以及主分支/手动触发的 Pages 发布 |

## 游戏模块

当前有 27 个游戏：`2048`、`breakout`、`chess`、`codebreaker`、`connect4`、`hackerword`、`hangman`、`invaders`、`lightsout`、`make-ten`、`maze`、`memory`、`minesweeper`、`nonogram`、`patterns`、`pipes`、`pong`、`robot`、`simon`、`snake`、`sokoban`、`sudoku`、`symmetry`、`tangram`、`tictactoe`、`traffic`、`xiangqi`。

典型模块结构为：

```text
games/<name>/
├── index.html          # 页面、控件与脚本加载顺序
├── styles.css          # 游戏专用样式
├── app.js              # DOM、输入、渲染与浏览器生命周期
├── game-core.js        # 规则、状态及转换，可在 Node 中测试
└── tests/*.test.js     # Node 内置测试运行器
```

规则模块通常兼容浏览器全局变量与 Node CommonJS。修改时保持已有的模块导出与脚本加载契约，不将 DOM 操作引入纯规则模块。

- 国际象棋还包含 `content.js`、`mode-core.js`、`progress-core.js`、`ai.js` 和本地 `vendor/chess.min.js`。页面使用经典脚本加载本地棋库；旧计划中的 CDN 方案属于历史记录。进度持久化使用 `localStorage`，变更时保留已有存档兼容性或提供迁移。
- 中国象棋包含独立 `ai.js`。重复局面判罚是常见长将/长捉的近似处理，复杂模糊局面保守判和，不应描述为完整竞赛裁判系统。
- 棋类 AI 在浏览器内进行本地搜索。当前项目没有服务端或 OpenAI API 运行依赖。

儿童游戏保持独立页面与局部样式：固定题库使用 `levels.js`（凑十由核心生成可配完的牌局），七巧板使用 `geometry.js`，小车解堵使用分片运行的 `solver.js`。翻牌和 Simon 在原页面增加儿童模式；推箱子另有 `kids-levels.js` 和 `solver.js`，保留经典 `LEVELS` 及旧核心调用。完成记录与模式偏好使用各游戏独立的版本化 localStorage 键；禁用存储仍可正常游戏。

各游戏独立维护，共用样式会影响多个页面。新增游戏时补齐门户、相关游戏导航与 README 在线目录；发布检查从目录发现游戏，不依赖固定数量。`.pen` 文件是设计参考，不参与运行。

## 打包与 URL

正常构建不转换页面、不从 `v1` 回写当前源码。`node scripts/build-site.js` 重建 `_site/`，复制 `index.html`、`src/`、`games/` 和 `v1/`，排除 `tests/` 与 `.pen` 文件。

```text
_site/
├── index.html
├── src/
├── games/<name>/
└── v1/
    ├── index.html
    └── games/<name>/
```

| 内容 | 本地从仓库或产物根目录提供 HTTP 服务 | GitHub Pages 路径 |
| --- | --- | --- |
| 门户 | `/` | `/games/` |
| 当前游戏 | `/games/<name>/` | `/games/games/<name>/` |
| 共享资源 | `/src/style.css` | `/games/src/style.css` |
| 历史门户 | `/v1/` | `/games/v1/` |
| 历史游戏 | `/v1/games/<name>/` | `/games/v1/games/<name>/` |

Pages 项目基路径为 `/games/`，源码目录也叫 `games/`，因此当前游戏 URL 包含两层 `games`。例如：[2048](https://naijoug.github.io/games/games/2048/)。保留现有路径结构，并使用相对链接兼容本地和 Pages 部署。

站点不需要 npm 安装、打包器或服务端。共享样式引用了外部 Google Fonts；静态资源检查不保证外部字体服务可用。

## 验证与发布

PR 工作流运行当前游戏和站点工具测试，构建产物并检查路径；不会部署。推送 `main` 或手动运行工作流时，验证成功后上传同一份产物并部署。CI 使用 Node.js 22，发布权限仅用于部署任务。

检查器遍历产物中的当前和历史 HTML，以实际 Pages 基路径解析静态、带引号的 `href`/`src`，验证本地目标存在、门户包含所有当前游戏，以及 README 在线目录完整且路由有效。它不检查 JavaScript 动态生成的链接、浏览器运行行为或远程资源可用性。UI 修改仍需相应浏览器验证。

规则变更优先验证受影响游戏。共享资源、导航或发布变更运行全量当前测试与产物检查；历史游戏逻辑变更再运行对应 `v1` 测试。通过后仅在新修改、失败或未决问题出现时追加验证。

## 历史布局转换

旧的 `scripts/build.js` 已更名为 `scripts/preview-v1-migration.js`。该工具把 `v1/games/` 页面套用终端布局，输出到 `_migration-preview/`，用于复查历史转换效果。它不属于正常构建或发布流程，且不会修改 `games/`、`src/` 或 `v1/`。

`_site/` 和 `_migration-preview/` 都是可重新生成的本地产物，已忽略于 Git。当前源码的后续修复直接维护在 `games/` 中。
