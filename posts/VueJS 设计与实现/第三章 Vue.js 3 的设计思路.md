---
description: >
  从框架设计的视角探讨现代前端框架需要解决的核心问题，
  包括声明式UI描述、虚拟DOM与渲染器实现、组件本质及模板编译原理。
  结合Vue 3的设计思路，分析渲染器对虚拟DOM的挂载与更新、组件的封装形式、
  编译器如何将模板编译为渲染函数，以及框架各模块如何相互配合构成有机整体

tags:
  - 前端框架
  - Vue 源码
  - 框架设计
  - 虚拟DOM
  - 前端工程化
  - JavaScript

date: 2026-03-14
coverImage: https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/vuejs.webp
location: 苏州
---

## 声明式地描述 UI

Vue.js 3 是一个声明式的 UI 框架，意思是说用户在使用 Vue.js 3 开发页面时是声明式地描述 UI 的

### 前端页面都涉及哪些内容呢？

- DOM 元素: 例如是 div 标签还是 a 标签
- 属性: 如 a 标签的 href 属性，再如 id、class 等通用属性
- 事件: 如 click、keydown 等
- 元素的层级结构: DOM 树的层级结构，既有子节点，又有父节点

### Vue.js 3 如何声明式地描述上述内容呢？

- 使用与 HTML 标签一致的方式来描述 DOM 元素，例如描述一个 div 标签时可以使用 `<div></div>`
- 使用与 HTML 标签一致的方式来描述属性，例如 `<div id="app"></div>`
- 使用 `:` 或 `v-bind` 来描述动态绑定的属性，例如 `<div :id="dynamicId"></div>`
- 使用 @ 或 v-on 来描述事件，例如 `<button @click="handleClick">Click me</button>`
- 使用与 HTML 标签一致的方式来描述层级结构,例如一个具有 span 子节点的 div 标签可以这样描述 `<div><span>Child</span></div>`

可以看到,在 Vue.js 中,哪怕是事件,都有与之对应的描述方式,这就是所谓的声明式地描述 UI

### 我们还可以使用 JavaScript 对象来描述

我们还可以使用 JavaScript 对象来描述,例如

```js
const title = {
  // 标签名称
  tag: 'h1',
  // 标签属性
  props: {
    onClick: handler,
  },
  // 子节点
  children: [{ tag: 'span' }],
}
```

对应到 Vue.js 模版,其实就是:

```vue
<h1 @click="handler">
  <span></span>
</h1>
```

## 初始渲染器

虚拟 DOM 是如何变成真实 DOM 并渲染到浏览器页面中的呢?

这就用到了我们接下来要介绍的: `渲染器`

### 假设我们有如下虚拟 DOM

```js
const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hello'),
  },
  children: 'click me',
}
```

### 首先简单解释一下上面这段代码

- `tag`: 表示 DOM 元素的标签名称，这里是 div 标签
- `props`: 表示 DOM 元素的属性，这里有一个 onClick 属性，表示当用户点击这个 div 标签时会弹出一个 alert 提示框
- `children`: 表示 DOM 元素的子节点，这里是一个文本节点，内容是 "click me"

### 接下来我们需要将这个虚拟 DOM 转换成真实 DOM 并渲染到页面中

```js
function render(vnode, container) {
  // 创建一个 DOM 元素
  const el = document.createElement(vnode.tag)
  // 遍历 vnode.props 中的属性并设置到 DOM 元素上
  for (const key in vnode.props) {
    const value = vnode.props[key]
    if (key.startsWith('on')) {
      // 如果属性名以 "on" 开头,说明这是一个事件处理函数,需要使用 addEventListener 来绑定事件
      el.addEventListener(key.slice(2).toLowerCase(), value)
    } else {
      // 否则,这是一个普通的属性,直接使用 setAttribute 来设置属性
      el.setAttribute(key, value)
    }
  }
  // 如果 children 是一个字符串,说明这是一个文本节点,直接设置 el.textContent 就可以了
  if (typeof vnode.children === 'string') {
    el.textContent = vnode.children
  } else {
    // 否则,说明 children 是一个数组,需要递归地调用 render 函数来渲染子节点
    vnode.children.forEach((child) => render(child, el))
  }
  // 最后将创建好的 DOM 元素添加到 container 中
  container.appendChild(el)
}
```

### 这里的 `render` 函数接受两个参数

- `vnode`: 需要渲染的虚拟 DOM
- `container`: 需要将虚拟 DOM 渲染到哪个 DOM 元素中

### 接下来,我们可以调用 `render` 函数来渲染虚拟 DOM

```js
const container = document.getElementById('app')
render(vnode, container)
```

## 组件的本质

组件就是一组 DOM 元素的封装

```js
const MyComponent = function () {
  return {
    tag: 'div',
    props: {
      onClick: () => alert('hello'),
    },
    children: 'click me',
  }
}
```

可以看到,组件的返回值也是虚拟 DOM, 它代表组件要渲染的内容

我们可以用虚拟 DOM 对象中的 tag 属性来存储组件函数

```js
const vnode = {
  tag: MyComponent,
}
```

当我们渲染这个虚拟 DOM 时,就会调用 MyComponent 函数来获取组件要渲染的内容

```js
function render(vnode, container) {
  if (typeof vnode.tag === 'function') {
    // 如果 vnode.tag 是一个函数,说明这是一个组件,需要调用这个函数来获取组件要渲染的内容
    const componentVNode = vnode.tag()
    render(componentVNode, container)
  } else {
    // 否则,说明 vnode.tag 是一个普通的 DOM 元素,按照之前的方式来渲染
    const el = document.createElement(vnode.tag)
    for (const key in vnode.props) {
      const value = vnode.props[key]
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach((child) => render(child, el))
    }
    container.appendChild(el)
  }
}
```

## 模版的工作原理

以我们熟悉的 `.vue` 文件为例,一个 `.vue` 文件就是一个组件

```vue
<template>
  <div @click="handler">click me</div>
</template>
<script>
export default {
  data() {},
  methods: {
    handler: () => {},
  },
}
</script>
```

其中 `<template>` 标签中的内容就是模版内容,编译器会把模版内容编译成渲染函数并添加到 `<script>` 标签中的组件对象上,所以最终在浏览器里运行的代码是:

```js
export default {
  data() {},
  methods: {
    handler: () => {},
  },
  render() {
    return h('div', { onClick: this.handler }, 'click me')
}
```

## Vue.js 是各个模块组成的有机整体

如前所诉,组件的实现依赖于**渲染器**,模版的编译依赖于**编译器**,并且编译后生成的代码是根据渲染器和虚拟 DOM 的设计决定的,因此 Vue.js 的各个模块之间是互相关联、互相制约的,共同构成一个有机整体
