---
title: 从零搭建一个 Medium 风格的 GitHub 博客
date: 2025-01-15
author: 5090Dv2
category: 项目
tags: 博客,前端,GitHub,JavaScript
excerpt: 一个基于 GitHub API 的无后端博客系统，用 Markdown 写作，用 GitHub 管理内容。
---

# 从零搭建一个 Medium 风格的 GitHub 博客

厌倦了传统博客平台的臃肿和限制，我决定用最简单的方式搭建自己的博客：GitHub 仓库存文章，前端直接调用 GitHub API 读取，无需后端，零成本运营。

## 项目地址

https://github.com/5090Dv2/blog

## 为什么这么做

- **零成本**：GitHub Pages 免费托管，不需要买服务器
- **零维护**：没有后端就不需要运维，不怕被攻击
- **写作体验好**：Markdown 写作，提交到 GitHub 就自动发布
- **数据自主**：所有文章都在我自己的仓库里，不怕平台跑路

## 技术栈

这个博客完全由前端构成：

- **HTML/CSS/JS**：纯原生，没有框架依赖
- **markdown-it**：Markdown 渲染器
- **GitHub API**：读取文章内容和提交信息
- **GitHub Pages**：静态托管

代码结构非常清晰：

```
blog/
├── index.html          # 单页应用入口
├── posts/              # 文章目录（Markdown）
├── src/
│   ├── js/             # 模块化 JavaScript
│   │   ├── app.js      # 主入口
│   │   ├── config.js   # 配置
│   │   ├── api.js      # GitHub API 调用
│   │   ├── renderer.js # 文章渲染
│   │   ├── search.js   # 搜索功能
│   │   └── theme.js    # 主题切换
│   └── styles/         # 模块化 CSS
│       ├── variables.css
│       ├── layout.css
│       └── ...
└── vite.config.js      # 构建配置
```

## 核心功能

### 1. 文章自动加载

博客通过 GitHub Contents API 读取 `posts/` 目录下的所有 `.md` 文件，解析 front matter 获取标题、日期、标签等信息，然后渲染成文章列表。

```javascript
const url = `https://api.github.com/repos/${owner}/${repo}/contents/posts`;
const response = await fetch(url);
const files = await response.json();
```

### 2. 编写人显示

每篇文章都会显示 GitHub 上最后一次提交该文件的人，自动从 Git 提交记录中获取。

### 3. 一键写文章

点击导航栏的「写文章」按钮，直接跳转到 GitHub 的文件创建页面，模板已经预填好了 front matter 格式，只需要填写标题和内容，提交后博客自动更新。

### 4. 主题切换

支持亮色和暗色主题，记住用户的偏好设置。

### 5. 全局搜索

支持按标题、标签、内容摘要搜索所有文章。

### 6. 归档和分类

自动按年份归档，按分类组织文章。

## 写作流程

使用这个博客写作只需要三步：

1. 在 `posts/` 目录创建 `.md` 文件
2. 填写 front matter 和正文
3. 推送到 GitHub

或者直接在网页上点击「写文章」，在 GitHub 网页编辑器里完成一切。

## 文章格式

```markdown
---
title: 文章标题
date: 2025-01-15
author: 5090Dv2
category: Minecraft
tags: Minecraft,Java,Spigot
excerpt: 一句话摘要
---

正文内容...
```

## 部署

GitHub Pages 从 `main` 分支的根目录读取静态文件，所以不需要额外的构建步骤。每次推送代码后，GitHub 会自动重新部署。

## 未来计划

- [ ] 评论系统（可能用 Giscus）
- [ ] RSS 订阅
- [ ] 更多主题选择
- [ ] 文章阅读量统计

## 写在最后

这个博客的设计理念是「简单」。没有复杂的配置，没有繁琐的依赖，只有最纯粹的写作体验。如果你也想搭建一个类似的博客，欢迎 Fork 这个项目。

---

*这个博客本身就是用这个博客发布的第一篇文章。*
