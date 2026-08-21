# 博客 · 由 GitHub 驱动

一个基于 GitHub 的现代化个人博客，参考 Medium 阅读风设计。把 Markdown 文件推送到仓库即可发布文章，并通过 **GitHub Pages** 自动部署上线。

## ✨ 功能特点

- ✍️ Medium 风阅读体验：衬线标题、舒适阅读宽度、克制配色
- 🌙 深色 / 浅色主题切换
- 🔍 全文搜索（Ctrl+K）
- 🏷️ 标签云 / 分类 / 归档
- 📖 自动阅读时长、阅读进度条
- 📱 完全响应式
- 🚀 GitHub Actions 自动构建并部署到 GitHub Pages

## 📁 项目结构

```
github-blog/
├── index.html                  # 主页面
├── package.json
├── vite.config.js
├── .github/workflows/
│   └── deploy.yml              # GitHub Pages 自动部署
├── posts/                      # 文章目录（Markdown）
│   ├── hello-world.md
│   └── javascript-async.md
└── src/
    ├── js/                     # 模块化逻辑
    │   ├── app.js              # 入口
    │   ├── config.js           # 仓库配置
    │   ├── api.js              # GitHub API
    │   ├── utils.js
    │   ├── theme.js
    │   ├── navigation.js
    │   ├── renderer.js
    │   └── search.js
    └── styles/                 # 样式（变量/基础/组件/布局/页面/Markdown/动画/响应式）
```

## ⚙️ 配置（必做）

编辑 `src/js/config.js`，填入你的仓库信息：

```javascript
export const CONFIG = {
  github: {
    owner: '5090Dv2',           // 你的 GitHub 用户名
    repo: 'blog',               // 仓库名
    branch: 'main',             // 文章所在分支
    postsDir: 'posts',          // 文章目录
  },
};
```

> 文章通过浏览器端 GitHub API 拉取，因此**仓库需为公开仓库**。

## 📝 发布文章

在仓库的 `posts/` 目录添加 `.md` 文件（支持 Frontmatter）：

```markdown
---
title: 文章标题
date: 2024-01-01
category: 技术
tags: JavaScript,前端
excerpt: 文章摘要（可选）
---

# 正文从这里开始
```

推送到 `main` 分支后，GitHub Pages 会自动重新构建部署，刷新页面即可看到新文章。

## 🚢 部署到 GitHub Pages（已配置好）

仓库已包含 `.github/workflows/deploy.yml`，实现：push 到 `main` → 自动 `npm ci && npm run build` → 部署 `dist/` 到 GitHub Pages。

启用步骤（一次性）：

1. 推送代码到 GitHub（`git push -u origin main`）。
2. 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 等待 Actions 跑完，访问 `https://5090Dv2.github.io/blog/`。

之后每次 push 都会自动更新站点，无需手动操作。

## 🔧 本地开发

```bash
npm install
npm run dev        # 本地预览
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物
```

## 📄 License

MIT
