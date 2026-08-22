---
title: "Knockback 调参实战：KBM 微调工具使用指南"
date: 2026-08-21
author: 5090Dv2
category: Minecraft
tags: Minecraft,Knockback,Spigot,Java
excerpt: 介绍 KnockbackManager 的调参方法，以及如何使用 KBM 微调工具高效调试击退参数。
---

## 什么是 KnockbackManager

KnockbackManager 是一个基于 ProtocolLib 的 Minecraft 1.8.8 插件，允许服务器管理员自定义玩家之间的击退行为。它修改了原版的击退计算逻辑，提供了更精细的控制。

## 击退参数解析

KnockbackManager 的核心配置文件 `settings.yml` 中，击退参数分为两个维度：

### 水平击退（Horizontal）

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `horizontal.ground` | 地面水平击退倍率 | 1.0 |
| `horizontal.air` | 空中水平击退倍率 | 1.0 |
| `horizontal.sprint_extra` | 冲刺额外水平击退 | 0.0 |

### 垂直击退（Vertical）

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `vertical.ground` | 地面垂直击退倍率 | 1.0 |
| `vertical.air` | 空中垂直击退倍率 | 1.0 |
| `vertical.sprint_extra` | 冲刺额外垂直击退 | 0.0 |

### 参数如何影响击退

在 ClubSpigot 的击退计算中，这些参数的作用方式如下：

```
knockbackReduction = 1.0 - 配置值
friction = 2.0 - knockbackReduction
最终击退 = 0.4 * (1.0 - knockbackReduction)
```

例如 `horizontal.ground = 1.5` 时：

- `knockbackReduction = 1.0 - 1.5 = -0.5`
- `friction = 2.0 - (-0.5) = 2.5`
- 最终水平击退 = `0.4 * 1.5 = 0.6`（比原版增强 50%）

## 调参的四种方法

### 1. 经典二分调试

最基础的方法。每次在游戏内测试两个方案（A 和 B），根据手感判断哪个更接近目标，不断缩小区间。

**优点**：简单直观，适合新手
**缺点**：每次只能收缩 50%，效率一般

### 2. 黄金分割搜索

利用黄金比例 0.618 进行区间收缩。根据确信程度（略微/中等/明显），收缩比例可调整为 61.8%、38.2% 或 23.6%。

**优点**：保留更多信息，收敛更快
**缺点**：需要更准确地评估手感差异

### 3. 插值反推

取 3 个不同的参数值，实测各自的位移，用数学拟合反推出目标参数值。

**优点**：精度最高，可直接算出理论最优值
**缺点**：需要精确测量位移

### 4. 候选对比

当不同情景下的最优 KB 相近但不完全相同时，可以为每个参数保留多个候选值，最后组合导出。

**优点**：灵活组合，适应复杂场景
**缺点**：需要多次调试积累候选

## 内嵌调试工具

以下工具集成了上述四种调试方法，支持自动保存、历史记录、YAML 导入导出等功能：

<iframe src="./tools/kbm/index.html" style="width:100%; height:700px; border:1px solid var(--border); border-radius:var(--radius-lg);"></iframe>

> 工具由 dw1e 编写，GitHub 仓库：[KnockbackManager](https://github.com/dw1e/KnockbackManager)

## 调参建议

1. **先确定水平击退**：水平击退是基础，建议从 `horizontal.ground` 开始调
2. **再调垂直击退**：垂直击退影响击飞高度，通常比水平击退值小
3. **最后调冲刺额外**：冲刺击退是叠加在基础击退之上的，影响较小
4. **保存预设**：每次调到满意的值就保存一个预设，方便回退
5. **实测验证**：调参后在服务器上多人测试，不同网络条件下的感受可能不同