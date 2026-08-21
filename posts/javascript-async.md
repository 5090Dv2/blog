---
title: Spigot 插件开发入门
date: 2024-12-10
author: 5090Dv2
category: Minecraft
tags: Minecraft,Java,Spigot,教程
excerpt: 从零开始学习 Minecraft Spigot 插件开发，包含环境搭建、基础概念和第一个插件。
---

# Spigot 插件开发入门

想给自己的 Minecraft 服务器加点功能？写插件是最直接的方式。这篇文章带你从零开始。

## 环境准备

### 1. 安装 JDK
Minecraft 1.17+ 需要 JDK 16 或更高版本。推荐用 JDK 17。

### 2. 下载 Spigot/Paper
- **Spigot**: https://www.spigotmc.org/
- **Paper**: https://papermc.io/ （推荐，性能更好）

### 3. IDE
用 IntelliJ IDEA，社区版免费够用。

## 你的第一个插件

### plugin.yml
每个插件都需要一个 `plugin.yml` 描述信息：

```yaml
name: MyFirstPlugin
version: 1.0
main: com.example.MyPlugin
api-version: '1.20'
```

### 主类
```java
public class MyPlugin extends JavaPlugin {
    @Override
    public void onEnable() {
        getLogger().info("插件已启用！");
    }
    
    @Override
    public void onDisable() {
        getLogger().info("插件已禁用！");
    }
}
```

### 监听事件
```java
public class PlayerListener implements Listener {
    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        event.getPlayer().sendMessage("欢迎来到服务器！");
    }
}
```

在主类里注册监听器：
```java
getServer().getPluginManager().registerEvents(new PlayerListener(), this);
```

## 常用 API

### 给玩家发消息
```java
player.sendMessage(ChatColor.GREEN + "你好！");
```

### 给玩家物品
```java
ItemStack item = new ItemStack(Material.DIAMOND_SWORD);
player.getInventory().addItem(item);
```

### 执行命令
```java
Bukkit.dispatchCommand(Bukkit.getConsoleSender(), "give " + player.getName() + " diamond 1");
```

## 打包和测试

用 Maven 或 Gradle 打包成 `.jar` 文件，放到服务器的 `plugins` 文件夹，重启服务器即可。

## 下一步

- 学习更多 Spigot API
- 研究 SQLite/MySQL 数据存储
- 了解 BungeeCord 跨服通信
- 开始写你自己的插件！

---

*写插件不难，难的是写出稳定、高性能的插件。多写多练，慢慢来。*
