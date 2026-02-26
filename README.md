# CaoKai Blog

一个面向个人技术分享的静态博客，基于 `Vue 3 + Vite SSG + Markdown`。

- 在线地址: https://blog.caoki.cn
- 构建产物: `dist/`

## 网站介绍

这个网站主要包含三类页面：

- 首页：作者信息、开源统计、近期内容导航
- 文章页：Markdown 渲染、目录、代码高亮、评论区（Giscus）
- 标签页：按分类聚合文章，支持快速切换

核心特性：

- Markdown 写作 + Frontmatter 元数据
- 文章目录、代码块高亮与复制
- SEO 产物自动生成（`sitemap.xml` / `robots.txt` / RSS / Atom）
- 构建期拉取 GitHub 仓库与评论统计，页面只读本地 JSON

## 页面预览

![首页](public/screenshots/home.webp)
![文章页](public/screenshots/article.webp)
![标签页](public/screenshots/tags.webp)

## 技术栈

- Vue 3
- Vite + vite-ssg
- Ant Design Vue
- Markdown + gray-matter
- Giscus

## 本地使用说明

环境要求：

- Node `^20.19.0` 或 `>=22.12.0`
- pnpm

安装依赖：

```bash
pnpm install
```

本地开发：

```bash
pnpm dev
```

生产构建与预览：

```bash
pnpm build
pnpm preview
```

常用脚本：

- `pnpm dev`：构建前拉取 GitHub 数据并启动开发服务器
- `pnpm build`：类型检查 + SSG 构建 + SEO 文件生成
- `pnpm build-only`：仅执行构建流程
- `pnpm update-github-data`：单独刷新 GitHub 统计 JSON
- `pnpm type-check`：TS 类型检查

## 写作说明

在 `posts/<分类>/<标题>.md` 下新增文章，例如：

```text
posts/前端/通过字体子集化提升网页加载性能.md
```

Frontmatter 示例：

```yaml
---
title: 字体子集化实战
description: 面向中文字体的前端性能优化实践
date: 2026-01-19
tags:
  - 前端性能优化
  - Web 字体
coverImage: https://example.com/cover.webp
wordCount: 1800
readTime: 8
location: 杭州
comments: 12
---
```

## 配置说明

站点主配置文件是 `site.config.json`，采用中文键名，主要分组：

- `站点`：地址、名称、描述、分享图、语言、品牌名
- `作者`：姓名、头像、简介、标签等
- `社交链接`：名称、图标、链接
- `微信`：二维码
- `统计`：建站日期
- `GitHub`：用户名、仓库、接口地址
- `评论.giscus`：评论仓库和分类配置
- `标签`：默认颜色与标签元信息

`评论.giscus` 最小必填字段：

- `仓库ID`
- `分类`
- `分类ID`

以下字段可省略并使用默认值：

- `服务地址`
- `仓库`（默认使用 `GitHub.仓库`）
- `映射`（默认 `pathname`）
- `指定词`（默认空字符串）
- `严格`（默认 `true`）
- `启用反应`（默认 `true`）
- `发送元数据`（默认 `false`）
- `输入框位置`（默认 `top`）
- `主题`（默认 `light`）
- `语言`（默认使用 `站点.语言`）
- `加载方式`（默认 `lazy`）

项目内置 `site.config` 校验器，启动和构建时会自动校验，不合规会直接报错；所有错误/警告信息均为中文。

## GitHub Token 说明

如需提升 GitHub API 限额，可在本地 `.env` 或 CI 环境变量中设置：

```bash
GITHUB_TOKEN=your_github_pat
```

未配置时会使用匿名请求，可能触发限流。

## 许可证

本项目采用 MIT 协议，详见 [LICENSE](LICENSE)。
