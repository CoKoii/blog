---
description: '精选 JavaScript 高频面试真题，涵盖作用域、闭包、原型链、异步机制、事件循环等核心知识点，配合清晰解析，帮助你系统复习 JS 面试重点，提升面试通过率'
tags: [JavaScript面试, 前端面试题, JS面试真题, 前端校招, 前端八股文]
date: 2026-01-15
coverImage: https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/javascript.webp
location: 杭州
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

---

## 说说你了解的js数据结构?

### 什么是数据结构

数据结构是计算机存储,组织数据的方式。不同的数据结构适用于不同的场景，选择合适的数据结构可以提高程序的效率和性能。

下面是常见的数据结构:

- 数组(Array)
- 栈(Stack)
- 队列(Queue)
- 链表(Linked List)
- 字典
- 散列表(Hash Table)
- 树(Tree)
- 图(Graph)
- 堆(Heap)

### `数组`

数组是一种最基础的数据结构，用一块连续的内存来存数据，大小在创建时就固定

生活中常见的清单就是数组的例子

当数据结构简单、不需要频繁查找或排序时，用数组很合适

如果数据很复杂，数组的作用就不大了

### `栈`

栈是一种遵循后进先出（LIFO）原则的有序集合

在栈里，新元素都接近栈顶，旧元素都接近栈底

每次加入新的元素和拿走元素都在顶部操作

![栈的后进先出](https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/houjinxianchu.webp)

### `队列`

队列是一种遵循先进先出（FIFO）原则的有序集合

队列在尾部添加新元素，在头部移除元素

最新加入的元素在队列尾部，最早加入的元素在队列头部

![队列的先进先出](https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/xianjinxianchu.webp)

### `链表`

链表也是一种列表，已经设计了数组，为什么还需要链表呢？

JavaScript中数组的主要问题

它们被实现成了对象，与其他语言（比如C++和Java）的数组相对，效率很低

如果你发现数组在实际使用时很慢，就可以考虑使用链表来代替它

使用条件：

链表几乎可以用在任何可以使用一维数组的情况中

如果需要随机访问，数组仍然是更好的选择

```javascript
// ===== 数组：中间插入 =====
const arr = [1, 2, 3, 4]
arr.splice(1, 0, 99) // 在索引 1 插入
console.log(arr) // [1, 99, 2, 3, 4]
// 实际效果：后面的元素整体移动

// ===== 链表：中间插入 =====
function Node(value, next = null) {
  this.value = value
  this.next = next
}

// 构建链表 1 → 2 → 3 → 4
const head = new Node(1, new Node(2, new Node(3, new Node(4))))

// 在 2 后插入 99
const newNode = new Node(99)
newNode.next = head.next.next
head.next.next = newNode

// 打印链表
let cur = head
const result = []
while (cur) {
  result.push(cur.value)
  cur = cur.next
}
console.log(result) // [1, 2, 99, 3, 4]
```

数组的插入需要移动后续元素，时间复杂度为 O(n)

而链表只需调整指针，时间复杂度为 O(1)

### `字典`

字典是一种以键值对形式存储数据的数据结构

javascript 中的 Object 就是以字典的形式设计的

### `散列表`

散列表是一种通过哈希函数将键映射到数组索引的数据结构

以数组为例,数组是通过索引来访问元素的

在散列表中,我们以键值对的形式存储数据,比如: age: 25

散列表就会把 age 这个字符串转换成一个数字索引,然后把 25 存储在这个索引位置

当查询时,.get('age') 时,散列表会再次通过哈希函数计算出 age 对应的索引,然后直接访问该索引位置的值

这样就避免了遍历整个数据结构,大大提高了查找效率

但是,这样的设计也带来了一些缺陷,不同的键可能会被映射到同一个索引位置,这就叫做哈希冲突

## DOM 常见的操作有哪些

- `创建节点`
- `查询节点`
- `更新节点`
- `添加节点`
- `删除节点`

```javascript
// 创建节点
const divEl = document.createElement('div')
const textNode = document.createTextNode('Hello World')
// 查询节点
const container = document.getElementById('container')
const items = document.getElementsByClassName('item')
const firstItem = document.querySelector('.item:first-child')
// 更新节点
divEl.textContent = 'Updated Content'
divEl.setAttribute('class', 'new-class')
// 添加节点
container.appendChild(divEl)
container.insertBefore(textNode, container.firstChild)
// 删除节点
container.removeChild(firstItem)
```

### 节点间的关系

![DOM节点关系](https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/nodeElement.webp)
