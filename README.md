# GitHub Native Astro Blog

一个基于 **Astro + SSG** 的个人博客：  
**GitHub Issues 是 CMS，Astro 是展示层，GitHub Actions 是同步层**。

## 核心特性

- 默认所有 Issue 都是博客文章（`/blog/[slug]`）
- label 分流：
  - `projects` → Projects 页面
  - `about` → About 页面（`/about`）
  - `hidden` → 不展示
- 无数据库、无运行时 GitHub API 请求、无客户端 token 暴露
- RSS + Sitemap + 静态生成

## 本地开发

```bash
pnpm install
pnpm dev
```

## Issue 同步脚本

```bash
GITHUB_TOKEN=xxx GITHUB_REPOSITORY=owner/repo pnpm sync:issues
```

该命令会：

1. 拉取仓库 Issues（自动分页）
2. 生成 `src/content/blog` / `src/content/projects` / `src/content/pages`
3. 输出标准 frontmatter（title/date/labels/issueNumber/url）

## GitHub Actions 自动同步

工作流文件：`.github/workflows/sync-issues.yml`

触发方式：

- Issue 新增/编辑/label 变更/关闭
- 每小时定时同步
- 手动触发（workflow_dispatch）

工作流会在有内容变化时自动提交 `src/content/**`。

## 内容写作约定（低摩擦）

默认流程：

1. New Issue
2. 写标题 + Markdown 正文
3. 发布

无需 frontmatter、无需复杂 schema。

## 部署（Vercel）

1. 导入 GitHub 仓库到 Vercel
2. 在 Vercel 环境变量设置 `SITE_URL`（例如 `https://your-domain.com`）
3. 每次内容同步提交后自动触发构建并发布
