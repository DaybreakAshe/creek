# Creek

源于自然，为你精选 —— 一个基于 Next.js 的全栈 Web 应用，支持 Google 登录、作品展示、工具收藏与管理、AI 聊天与多语言切换。

网站：[https://www.icreek.xyz](https://www.icreek.xyz)

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
| 媒体 CDN | Sirv |
| AI | [Vercel AI SDK](https://ai-sdk.dev/) + [@ai-sdk/google](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)（Gemini） |
| 主题 | next-themes（亮色 / 暗色 / 跟随系统） |

## 环境要求

- **Node.js** 18.18+
- **pnpm**（推荐）或 npm / yarn
- **MongoDB**
- **Google Cloud** OAuth 凭据
- **Google AI Studio** API Key（AI 聊天，可选）
- **Sirv**（作品上传，可选）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

| 变量 | 说明 |
|------|------|
| `NEXTAUTH_URL` | 站点地址，本地 `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth 密钥，`openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `MONGODB_URI` | MongoDB 连接字符串 |
| `ADMIN_USER_ID` | 管理员 User ID（`/profile` 查看） |
| `SIRV_CLIENT_ID` / `SIRV_CLIENT_SECRET` / `SIRV_CDN_URL` | Sirv CDN |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API Key |
| `GEMINI_MODEL` | 可选，默认 `gemini-2.5-flash` |

Google OAuth 详见 [README_AUTH.md](./README_AUTH.md)。

### 3. 开发 / 构建

```bash
pnpm dev      # http://localhost:3000
pnpm build
pnpm start
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发服务器（Turbopack） |
| `pnpm build` | 生产构建 |
| `pnpm start` | 生产运行 |
| `pnpm db:seed-tools` | 种子工具数据 |

## 主要功能

- **首页** — 公开作品瀑布流，登录后可上传
- **工具** — `/tools` 浏览公开工具，`/tools/mine` 管理个人工具
- **AI 聊天** — `/chat`，Gemini 流式对话（需登录）
- **登录** — Google OAuth（`/login`）
- **个人主页** — `/profile`
- **管理后台** — `/admin`（`ADMIN_USER_ID`）

## 项目结构

```
app/
├── [locale]/
│   ├── (main)/       # 首页、工具、作品、登录、管理后台
│   └── chat/         # AI 聊天（全屏）
├── api/chat/         # 聊天 API（含 RAG）
components/           # UI 组件
lib/                  # 业务逻辑、AI、数据库
docs/
└── creek-knowledge.md  # AI 助手产品知识库（RAG）
i18n/                 # 国际化
messages/             # zh.json / en.json
```

## API

| 端点 | 说明 |
|------|------|
| `POST /api/chat` | AI 聊天（需登录），`{ messages }`，UI Message Stream；系统提示词注入 [docs/creek-knowledge.md](./docs/creek-knowledge.md) |

## 管理员

1. 登录后在 `/profile` 查看 **User ID**
2. 写入 `.env.local` 的 `ADMIN_USER_ID`
3. 重启后访问 `/admin`

## 相关文档

- [README_AUTH.md](./README_AUTH.md) — Google OAuth 与 NextAuth
- [docs/creek-knowledge.md](./docs/creek-knowledge.md) — AI 聊天产品知识库（RAG）
