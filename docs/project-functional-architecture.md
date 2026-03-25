# 项目功能架构文档

## 1. 项目目标

本项目是一个基于浏览器的小游戏集合站点，目标是：
- 提供统一首页入口，集中访问多款小游戏。
- 每个游戏独立开发、独立测试、独立发布静态资源。
- 所有游戏源码目录统一收敛到 `games/` 下管理。

## 2. 功能架构分层

### 2.1 门户层（Portal）
- 根目录 `index.html` 作为统一入口。
- 展示全部游戏卡片并跳转到各游戏路径。

### 2.2 游戏实现层（Game Runtime）
- 真实游戏代码统一放置于 `games/<game-name>/`。
- 每个游戏目录通常包含：
  - `index.html`（页面入口）
  - `style.css`（样式）
  - `script.js` 或多 JS 文件（游戏逻辑）
  - `tests/`（测试用例）

### 2.3 文档与计划层（Docs）
- `docs/` 存放架构文档与实施计划。
- `docs/plans/` 存放按日期归档的设计/实现计划。

### 2.4 发布层（Deployment）
- GitHub Actions 工作流 `.github/workflows/deploy-2048-pages.yml` 负责打包静态站点。
- 构建时会复制根 `index.html`，并将 `games/*` 下每个游戏目录扁平发布到站点根路径。
- 发布后访问规则：
  - 根 `index.html`
  - 站点内游戏路由为 `/<game-name>/`
  - GitHub Pages 完整 URL 为 `https://naijoug.github.io/games/<game-name>/`

## 3. 当前游戏模块

- `2048`
- `snake`
- `tictactoe`
- `minesweeper`
- `memory`
- `connect4`
- `hangman`
- `simon`
- `chess`
- `xiangqi`

## 4. 目录结构（重构后）

```text
.
├── .github/
├── docs/
│   ├── plans/
│   └── project-functional-architecture.md
├── games/
│   ├── 2048/
│   ├── chess/
│   ├── connect4/
│   ├── hangman/
│   ├── memory/
│   ├── minesweeper/
│   ├── simon/
│   ├── snake/
│   ├── tictactoe/
│   └── xiangqi/
├── README.md
└── index.html
```

## 5. 关键设计原则

- **模块独立**：各游戏互不耦合，便于单独维护与替换。
- **统一入口**：用户通过同一主页访问全部游戏。
- **源码收敛**：全部游戏源码统一位于 `games/` 下，减少根目录噪音。
- **静态可部署**：纯静态资源可直接发布到 GitHub Pages。
