# GitHub 博客

一个基于 GitHub 的现代化个人博客，通过上传 Markdown 文件到 GitHub 仓库来发布文章。

![博客预览](https://via.placeholder.com/800x400.png?text=Blog+Preview)

## ✨ 功能特点

- 🎨 现代化 UI 设计，支持深色/浅色主题
- 📱 完全响应式，支持移动端
- 🏷️ 支持文章标签和分类
- 📖 自动计算阅读时间
- 🎭 支持 Frontmatter 元数据
- ⚡ 基于 Vite，开发体验优秀
- 🚀 部署到 GitHub Pages，完全免费

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/github-blog.git
cd github-blog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置博客

编辑 `src/main.js` 中的 `CONFIG` 对象：

```javascript
const CONFIG = {
  owner: 'your-username',        // 你的 GitHub 用户名
  repo: 'your-blog-repo',       // 仓库名
  branch: 'main',               // 分支名
  postsDir: 'posts',            // 文章存放目录
};
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
```

## 📝 发布文章

### 1. 创建文章

在 GitHub 仓库的 `posts` 目录下创建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2024-01-01
author: 作者名
tags: 标签1,标签2
excerpt: 文章摘要（可选）
---

# 文章标题

这里是文章内容...
```

### 2. 推送到 GitHub

```bash
git add .
git commit -m "添加新文章"
git push origin main
```

### 3. 查看文章

刷新博客页面，新文章会自动显示。

## 🎨 自定义配置

### 修改博客信息

编辑 `index.html` 中的标题和描述：

```html
<title>你的博客标题</title>
<meta name="description" content="你的博客描述">
```

### 修改主题色

编辑 `src/style.css` 中的 CSS 变量：

```css
:root {
  --color-primary: #2563eb;  /* 主题色 */
  /* ... */
}
```

### 添加新页面

1. 在 `index.html` 中添加页面 HTML
2. 在 `src/main.js` 中添加页面切换逻辑
3. 在 `src/style.css` 中添加页面样式

## 📁 项目结构

```
github-blog/
├── index.html              # 主页面
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
├── posts/                  # 文章目录
│   ├── hello-world.md
│   └── javascript-async.md
└── src/
    ├── main.js             # 主逻辑
    ├── style.css           # 样式文件
    └── config.js           # 配置文件
```

## 🚢 部署到 GitHub Pages

### 方法一：使用 GitHub Actions

1. 在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. 推送代码，GitHub Actions 会自动部署

### 方法二：手动部署

```bash
npm run build
cd dist
git init
git add .
git commit -m "Deploy"
git push -f git@github.com:your-username/your-repo.git main:gh-pages
```

## 🔧 开发

### 本地开发

```bash
npm run dev
```

### 代码检查

```bash
npm run lint
```

### 构建

```bash
npm run build
```

## 📚 相关资源

- [GitHub API 文档](https://docs.github.com/en/rest)
- [Markdown 语法](https://www.markdownguide.org/)
- [Vite 文档](https://vitejs.dev/)

## 📄 License

MIT © [Your Name]
