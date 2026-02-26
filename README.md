# CaoKai Blog

个人技术博客。

- 在线地址: https://blog.caoki.cn
- 技术栈: Vue 3 + Vite SSG + Markdown

## 本地运行

要求: Node `^20.19.0` 或 `>=22.12.0`，`pnpm`

```bash
pnpm install
pnpm dev
```

构建与预览:

```bash
pnpm build
pnpm preview
```

## 写作

在 `posts/<分类>/<标题>.md` 新增文章，例如:

```text
posts/前端/通过字体子集化提升网页加载性能.md
```

## 配置

主配置文件: `site.config.json`（中文字段）

- 站点信息: `站点`
- 作者信息: `作者`
- 评论配置: `评论.giscus`
- GitHub 统计: `GitHub`

`评论.giscus` 最小必填:

- `仓库ID`
- `分类`
- `分类ID`

可选提升限额:

```bash
GITHUB_TOKEN=your_github_pat
```

## 常用命令

- `pnpm dev` 本地开发
- `pnpm build` 生产构建
- `pnpm build-only` 仅构建
- `pnpm update-github-data` 刷新 GitHub 数据

## 许可证

MIT，见 [LICENSE](LICENSE)。
