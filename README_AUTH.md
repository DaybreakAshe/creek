# 登录功能配置指南

## 🎯 GOOGLE_CLIENT_ID 等数据应该写在哪里？

**答案：写在 `.env.local` 文件中**

## 📝 配置步骤

### 1. 创建本地环境变量文件

项目根目录下应该有 `.env.local` 文件（已被 gitignore 忽略，不会提交到仓库）

```bash
# 如果文件不存在，创建它
touch .env.local
```

### 2. 填充环境变量

编辑 `.env.local` 文件，添加以下内容：

```env
# NextAuth 密钥 (必需)
# 生成命令: openssl rand -base64 32
NEXTAUTH_SECRET=这里填入你生成的密钥
NEXTAUTH_URL=http://localhost:3000

# Google OAuth 配置 (必需)
# 在 https://console.cloud.google.com/ 获取
GOOGLE_CLIENT_ID=你的Google_Client_ID
GOOGLE_CLIENT_SECRET=你的Google_Client_Secret

# MongoDB (如果需要)
MONGODB_URI=mongodb://localhost:27017/your-database
```

### 3. 获取 Google OAuth 凭据

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建/选择项目
3. 启用 Google+ API 或 People API
4. 创建 OAuth 2.0 客户端 ID：
   - 选择 "Web application"
   - 授权重定向 URI: `http://localhost:3000/api/auth/callback/google`
5. 复制 Client ID 和 Client Secret

### 4. 生成 NextAuth Secret

```bash
openssl rand -base64 32
```

将生成的密钥填入 `NEXTAUTH_SECRET`

## ⚠️ 重要提示

1. **`.env.local`** 已经添加到了 `.gitignore`，不会被提交到仓库
2. **不要**将真实的密钥提交到任何代码仓库
3. 生产环境部署时，需要在部署平台（如 Vercel）的环境变量设置中手动添加这些值
4. `.env.example` 文件只包含占位符，用于说明需要哪些环境变量

## 🚀 测试登录

配置完成后，重启开发服务器：

```bash
pnpm dev
```

访问 `http://localhost:3000/login` 测试登录功能。

