---
description: '精选 JavaScript 高频面试真题，涵盖作用域、闭包、原型链、异步机制、事件循环等核心知识点，配合清晰解析，帮助你系统复习 JS 面试重点，提升面试通过率。'
tags: [JavaScript面试, 前端面试题, JS面试真题, 前端校招, 前端八股文]
date: 2026-01-15
coverImage: https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/javascript.svg
wordCount: 1800
readTime: 8
location: 杭州
comments: 3
---

## 说说 JavaScript 中的数据类型? 存储上的差别?

### 前言

在 JavaScript 中，我们可以将数据分为两种类型：**基本类型**和**引用类型**。  
**基本类型**主要有以下 6 类：

- `String`
- `Number`
- `Boolean`
- `Null`
- `Undefined`
- `Symbol`

---

**引用类型**有：

- `Function`
- `Object`
- `Array`
- `Map`
- `Set`
- `Date`
- `RegExp`

两种类型的区别在于**存储方式**不同

基本类型的数据是存储在**栈内存**中的，栈内存用于存储简单数据类型，数据的大小是固定的，访问速度快。

引用类型的数据是存储在**堆内存**中的，堆内存用于存储复杂数据类型，数据的大小是不固定的，访问速度相对较慢。

### 举例说明

```javascript
// 基本类型
let a = 10
let b = a // b 复制了 a 的值
a = 20
console.log(b) // 输出 10，b 不受 a 变化的影响
```

a 的值是一个基本类型，存储在栈内存中，当我们将 a 赋值给 b 时，b 复制了 a 的值，之后 a 的变化不会影响 b。

![栈内存](https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/zhanneicun.webp)

```javascript
// 引用类型
let obj1 = { name: 'Alice' }
let obj2 = obj1 // obj2 引用 obj1 的地址
obj1.name = 'Bob'
console.log(obj2.name) // 输出 'Bob'，obj2 受 obj1 变化的影响
```

obj1 是一个引用类型，存储在堆内存中，当我们将 obj1 赋值给 obj2 时，obj2 只是引用了 obj1 的地址，实际上这个地址指向了同一个堆内存对象,所以当 obj1 变化时，obj2 也会受到影响。

![堆内存](https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/duineicun.webp)

### 总结

- **数据类型**: 分为`基本类型`和`引用类型`
- **存储区别**: 基本类型存储在栈内存中，赋值时是复制值, 互不影响；引用类型存储在堆内存中，赋值时是复制地址引用, 数据会共同变化
