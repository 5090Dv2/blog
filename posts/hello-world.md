---
title: 从零搭建现代化个人博客
date: 2024-12-15
author: 张三
category: 教程
tags: 博客,教程,前端,GitHub
excerpt: 本教程将带你从零开始搭建一个基于 GitHub 的现代化个人博客，采用模块化架构设计。
---

# 从零搭建现代化个人博客

想要拥有一个属于自己的现代化博客？本教程将带你从零开始搭建一个基于 GitHub 的个人博客。

## 为什么选择这个方案？

- **现代化设计**：采用最新的 UI 设计理念
- **模块化架构**：代码结构清晰，易于维护
- **完全免费**：无需购买服务器
- **响应式**：完美适配各种设备

## 架构设计

```
github-blog/
├── src/
│   ├── js/           # JavaScript 模块
│   │   ├── app.js    # 主入口
│   │   ├── config.js # 配置
│   │   ├── api.js    # API 请求
│   │   ├── utils.js  # 工具函数
│   │   ├── theme.js  # 主题管理
│   │   ├── navigation.js # 导航
│   │   ├── renderer.js # 渲染器
│   │   └── search.js # 搜索
│   └── styles/       # CSS 样式
│       ├── variables.css
│       ├── base.css
│       ├── components.css
│       ├── layout.css
│       ├── pages.css
│       ├── markdown.css
│       ├── animations.css
│       └── responsive.css
└── posts/            # 文章目录
```

## 核心功能

### 1. 模块化设计

每个功能都是独立的模块：

```javascript
// config.js - 配置管理
export const CONFIG = {
  github: {
    owner: 'your-username',
    repo: 'your-blog-repo',
  },
};
```

### 2. 主题切换

支持深色/浅色主题：

```javascript
// theme.js
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}
```

### 3. 搜索功能

支持全文搜索：

```javascript
// search.js
export function searchPosts(query) {
  return parsedPosts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.tags.some(t => t.toLowerCase().includes(query))
  );
}
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 发布文章

在 `posts` 目录下创建 Markdown 文件：

```markdown
---
title: 文章标题
date: 2024-01-01
category: 技术
tags: JavaScript, 前端
---

这里是文章内容...
```

## 总结

这个博客系统具有：
- 现代化的 UI 设计
- 模块化的代码架构
- 完整的功能（搜索、分类、标签）
- 响应式设计
- 主题切换

开始你的博客之旅吧！
