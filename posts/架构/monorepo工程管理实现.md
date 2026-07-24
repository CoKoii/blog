---
title: Monorepo 工程管理实现
description: >
  从工程管理视角介绍 Monorepo 的基本概念，
  并通过 Multi-repo 与 Monorepo 的目录结构对比，
  梳理单仓管理在多项目协作、代码复用和工程规范统一上的价值。
tags:
  - Monorepo
  - 工程化
  - 项目管理
  - 前端架构
date: 2026-07-24
coverImage: https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/monorepo.webp
location: 苏州
---

## 前言

Monorepo（Monolithic Repository）本身不是某个工具，而是一种代码仓库管理模式（Repository Strategy）。Monorepo 中文通常称为单一代码仓库或单体仓库，指的是将多个项目、服务、组件、工具库统一放在一个 Git 仓库中进行管理。

## 传统 Multi-repo 与 Monorepo 对比

### Multi-repo

```text
company-projects/
├── user-service.git
├── frontend-web.git
├── frontend-admin.git
└── ...
```

每个项目对应一个 Git 仓库，项目边界清晰，但仓库数量多时，公共依赖、工程规范和跨项目联调的维护成本也会随之增加。

### Monorepo

```text
company-platform.git
├── apps/
│   ├── web/
│   └── admin/
├── services/
│   └── user-service/
├── packages/
│   └── shared/
├── package.json
└── pnpm-workspace.yaml
```

所有代码统一放在一个 Git 仓库中管理，适合多个项目之间存在公共包、共享配置或频繁协作的场景。
