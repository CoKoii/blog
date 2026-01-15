---
title: 'JavaScript面试真题'
description: '一个用于演练常见 Markdown（GFM）语法的单文件示例。'
tags: [seo, markdown, demo]
date: 2025-01-14
coverImage: https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1600
wordCount: 1800
readTime: 8
views: 125
location: 深圳
comments: 3
---

# 更好的SEO

> 一则精简的 SEO 笔记，刻意使用了 _许多_ Markdown 特性。
>
> 嵌套引用：
>
> > 搜索是一场对话，而不是终点。

## 1. 目的

本文档**不是**完整的 SEO 指南；它是带有 SEO 语境的*语法展示*。  
可用于验证渲染器、主题和导出效果。

### 1.1 强调变体

- _italic_
- **bold**
- **_bold italic_**
- ~~strikethrough~~
- Inline `code` sample
- 转义字符：\* \_ \# \[ \] \(

## 2. 列表

### 2.1 无序

- 标题标签
- Meta 描述
  - 控制在约 160 字以内
  - 包含一个主关键词
- H1/H2 层级

### 2.2 有序

1. 调研主题
2. 拟定大纲
3. 发布
   1. 提交站点地图
   2. 申请索引

### 2.3 任务清单

- [x] 定义目标关键词
- [x] 撰写草稿
- [ ] 添加站内链接
- [ ] 测量 CTR

## 3. 链接与引用

行内链接：[Google Search Central](https://developers.google.com/search)。

引用链接：[SEO 指南][seo-guide]。

自动链接：<https://www.example.com/seo>。

[seo-guide]: https://moz.com/learn/seo 'Moz 新手指南'

## 4. 图片

![SEO 示意图](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800 '替代文本有助于无障碍')

## 5. 表格

| 信号 | 重要原因        | 示例            |
| ---- | --------------- | --------------- |
| 标题 | 排名相关性      | "本地 SEO 技巧" |
| 速度 | 体验 + 抓取效率 | LCP < 2.5s      |
| 链接 | 权威性          | 站内枢纽        |

## 6. 代码块

围栏代码（HTML）：

```html
<meta name="description" content="Concise summary for SERP." />
```

围栏代码（JSON）：

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "SEO Markdown Playground"
}
```

缩进代码块：

    curl -I https://www.example.com

## 7. 分隔线

---

## 8. 引用 + 列表组合

> 核心清单：
>
> - 仅一个 H1
> - 标题层级清晰
> - 描述性锚文本

## 9. 脚注

脚注示例[^1]。

[^1]: 关于 E-E-A-T 与信任的简短说明。

## 10. HTML 混用

<details>
  <summary>点击展开</summary>
  <p>隐藏文本可能有用，但避免关键词堆砌。</p>
</details>

<kbd>⌘</kbd> + <kbd>K</kbd> 用于站内搜索（如支持）。

## 11. 定义列表（扩展）

SEO
: 搜索引擎优化。

SERP
: 搜索引擎结果页。

## 12. 标题深度

#### H4 示例

##### H5 示例

###### H6 示例

## 13. 最后说明

使用此文件测试你的 Markdown 功能渲染流程。
