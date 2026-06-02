# Creek

源于自然，为你精选 —— 一个基于 Next.js 的全栈 Web 应用，支持 Google 登录、工具收藏与管理、多语言切换。

网站链接：[(https://www.icreek.xyz)](https://www.icreek.xyz)

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Next.js 16](https://nextjs.org/)（App Router + Turbopack） |
| 语言 | TypeScript |
| UI | React 19、Tailwind CSS 4、Radix UI、Lucide Icons |
| 认证 | [NextAuth.js](https://next-auth.js.org/)（Google OAuth） |
| 数据库 | [MongoDB](https://www.mongodb.com/) + Mongoose |
| 国际化 | [next-intl](https://next-intl.dev/)（中文 / 英文） |
| 数据请求 | SWR |
| 主题 | next-themes（亮色 / 暗色 / 跟随系统） |

## 环境要求

- **Node.js** 18.18 或更高版本
- **pnpm**（推荐）或 npm / yarn
- **MongoDB** 本地实例或远程连接
- **Google Cloud** OAuth 凭据（用于登录）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制示例文件并填入真实值：

```bash
cp .env.example .env.local
```

`.env.local` 中需要配置：

| 变量 | 说明 |
|------|------|
| `NEXTAUTH_URL` | 站点地址，本地为 `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth 密钥，可用 `openssl rand -base64 32` 生成 |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `MONGODB_URI` | MongoDB 连接字符串 |
| `ADMIN_USER_ID` | 管理员 User ID（登录后可访问 `/admin`） |
| `SIRV_CLIENT_ID` | Sirv API Client ID |
| `SIRV_CLIENT_SECRET` | Sirv API Client Secret |
| `SIRV_CDN_URL` | Sirv CDN 域名（如 `your-account.sirv.com`） |

Google OAuth 与 NextAuth 的详细配置步骤见 [README_AUTH.md](./README_AUTH.md)。

### 3. 启动开发服务器

```bash
pnpm dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 4. 生产构建

```bash
pnpm build
pnpm start
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（Turbopack） |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 运行生产服务器 |

## 主要功能

- **首页 / 关于** — 站点展示页
- **工具集合** — 浏览公开工具、管理个人工具（需登录）
- **用户登录** — Google OAuth 一键登录（`/login`）
- **个人主页** — 查看账户信息（`/profile`）
- **管理后台** — 工具与用户管理（`/admin`，仅 `ADMIN_USER_ID` 对应账号可访问）
- **多语言** — 默认中文，支持英文（`/en/...`）

## 项目结构

```
app/
├── [locale]/          # 页面路由（含 i18n）
│   ├── admin/         # 管理后台
│   ├── tools/         # 工具相关页面
│   ├── login/         # 登录页
│   └── ...
├── api/               # API 路由
└── layout.tsx         # 根布局

i18n/                  # 国际化配置
messages/              # 中英文文案（zh.json / en.json）
lib/                   # 工具函数、数据库、鉴权等
components/            # UI 组件
middleware.ts          # 国际化 + 鉴权中间件
```

## 管理员说明

1. 使用 Google 账号登录后，在 `/profile` 页面查看自己的 **User ID**
2. 将该 ID 写入 `.env.local` 的 `ADMIN_USER_ID`
3. 重启开发服务器，即可访问 `/admin`

未登录访问 `/admin` 会跳转登录页；非管理员账号会被重定向到首页。

## 相关文档

- [README_AUTH.md](./README_AUTH.md) — Google OAuth 与 NextAuth 配置指南
