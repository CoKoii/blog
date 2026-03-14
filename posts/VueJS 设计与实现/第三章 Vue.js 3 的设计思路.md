---
description: >
  从框架设计的视角探讨现代前端框架需要解决的核心问题，
  包括开发体验、错误处理、代码体积控制、Tree-Shaking、构建产物形式以及特性开关等机制。
  结合 Vue 的实现思路，分析这些设计如何在可维护性、性能与工程化之间取得平衡。

tags:
  - 前端框架
  - Vue 源码
  - 框架设计
  - Tree-Shaking
  - 前端工程化
  - JavaScript

date: 2026-03-14
coverImage: https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/vuejs.webp
location: 苏州
---

## 声明式地描述 UI

Vue.js 3 是一个声明式的 UI 框架，意思是说用户在使用 Vue.js 3 开发页面时是声明式地描述 UI 的

前端页面都涉及哪些内容呢？

- DOM 元素: 例如是 div 标签还是 a 标签
- 属性: 如 a 标签的 href 属性，再如 id、class 等通用属性
- 事件: 如 click、keydown 等
- 元素的层级结构: DOM 树的层级结构，既有子节点，又有父节点

Vue.js 3 如何声明式地描述上述内容呢？

- 使用与 HTML 标签一致的方式来描述 DOM 元素，例如描述一个 div 标签时可以使用 `<div></div>`
- 使用与 HTML 标签一致的方式来描述属性，例如 `<div id="app"></div>`
- 使用 `:` 或 `v-bind` 来描述动态绑定的属性，例如 `<div :id="dynamicId"></div>`
- 使用 @ 或 v-on 来描述事件，例如 `<button @click="handleClick">Click me</button>`
- 使用与 HTML 标签一致的方式来描述层级结构,例如一个具有 span 子节点的 div 标签可以这样描述 `<div><span>Child</span></div>`

可以看到,在 Vue.js 中,哪怕是事件,都有与之对应的描述方式,这就是所谓的声明式地描述 UI

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
