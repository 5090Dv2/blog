---
title: JavaScript 异步编程深度指南
date: 2024-12-10
author: 张三
category: 技术
tags: JavaScript,异步编程,Promise
excerpt: 深入理解 JavaScript 异步编程，从回调函数到 Promise，再到 async/await 的完整指南。
---

# JavaScript 异步编程深度指南

异步编程是 JavaScript 中最重要的概念之一。本文将带你深入理解异步编程的核心原理。

## 为什么需要异步？

JavaScript 是单线程语言，所有操作都是同步执行的。如果一个操作需要很长时间，整个页面就会被阻塞。

```javascript
// 这会导致页面卡顿
const data = fetchData(); // 需要 3 秒
console.log(data);
```

## 回调函数

最原始的异步解决方案：

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { name: '张三' });
  }, 1000);
}

fetchData((err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

### 回调地狱问题

```javascript
getData(function(a) {
  getMoreData(a, function(b) {
    getEvenMoreData(b, function(c) {
      console.log(c);
    });
  });
});
```

## Promise

Promise 是对回调函数的改进：

```javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ name: '张三' });
    }, 1000);
  });
}

fetchData()
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Promise 链式调用

```javascript
getData()
  .then(a => getMoreData(a))
  .then(b => getEvenMoreData(b))
  .then(c => console.log(c))
  .catch(err => console.error(err));
```

### Promise 方法

```javascript
// Promise.all - 所有都成功才成功
Promise.all([promise1, promise2, promise3]);

// Promise.race - 第一个完成的
Promise.race([promise1, promise2, promise3]);

// Promise.allSettled - 等所有都完成
Promise.allSettled([promise1, promise2, promise3]);
```

## async/await

async/await 是 Promise 的语法糖：

```javascript
async function getData() {
  try {
    const a = await getData();
    const b = await getMoreData(a);
    const c = await getEvenMoreData(b);
    console.log(c);
  } catch (err) {
    console.error(err);
  }
}
```

### 并发执行

```javascript
async function getData() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  
  return { users, posts, comments };
}
```

## 实际应用

### 重试机制

```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### 超时控制

```javascript
function timeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}
```

## 总结

| 方案 | 优点 | 缺点 |
|------|------|------|
| 回调函数 | 简单 | 回调地狱 |
| Promise | 链式调用 | 仍有回调 |
| async/await | 同步写法 | 需要 try/catch |

建议在现代 JavaScript 开发中优先使用 async/await。
