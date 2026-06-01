/**
 * 向 MongoDB 写入公开 AI 工具列表（按 url 去重 upsert）。
 * 运行: pnpm db:seed-tools
 */
import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import Tool from '@/models/tool'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
}

type SeedTool = {
  name: string
  url: string
  description: string
  category: string
  iconDomain: string
}

const SEED_TOOLS: SeedTool[] = [
  // —— 国际 · 对话 / 助手 ——
  {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    description: 'OpenAI 旗舰对话助手，支持 GPT-4o 与多模态。',
    category: 'ai',
    iconDomain: 'chatgpt.com',
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    description: 'Anthropic 长上下文与安全对齐的对话模型。',
    category: 'ai',
    iconDomain: 'claude.ai',
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    description: 'Google 多模态 AI，集成搜索与 Workspace。',
    category: 'ai',
    iconDomain: 'gemini.google.com',
  },
  {
    name: 'Microsoft Copilot',
    url: 'https://copilot.microsoft.com',
    description: '微软 AI 助手，覆盖 Bing、Edge 与 Office。',
    category: 'ai',
    iconDomain: 'copilot.microsoft.com',
  },
  {
    name: 'Perplexity',
    url: 'https://www.perplexity.ai',
    description: 'AI 搜索引擎，带引用来源的答案。',
    category: 'search',
    iconDomain: 'perplexity.ai',
  },
  {
    name: 'Grok',
    url: 'https://grok.com',
    description: 'xAI 对话模型，可访问 X 平台实时信息。',
    category: 'ai',
    iconDomain: 'grok.com',
  },
  {
    name: 'Meta AI',
    url: 'https://www.meta.ai',
    description: 'Meta 出品的助手，整合 Llama 与社交场景。',
    category: 'ai',
    iconDomain: 'meta.ai',
  },
  {
    name: 'Mistral Le Chat',
    url: 'https://chat.mistral.ai',
    description: 'Mistral 欧洲开源团队的官方聊天产品。',
    category: 'ai',
    iconDomain: 'mistral.ai',
  },
  {
    name: 'Poe',
    url: 'https://poe.com',
    description: 'Quora 聚合多模型的统一聊天入口。',
    category: 'ai',
    iconDomain: 'poe.com',
  },
  {
    name: 'Hugging Face',
    url: 'https://huggingface.co',
    description: '开源模型社区、Spaces 与推理 API。',
    category: 'ai',
    iconDomain: 'huggingface.co',
  },
  {
    name: 'Replicate',
    url: 'https://replicate.com',
    description: '云端运行开源模型，覆盖图像、语言与音频。',
    category: 'ai',
    iconDomain: 'replicate.com',
  },
  // —— 国际 · 编程 ——
  {
    name: 'Cursor',
    url: 'https://cursor.com',
    description: 'AI 原生代码编辑器，深度集成 Agent 工作流。',
    category: 'coding',
    iconDomain: 'cursor.com',
  },
  {
    name: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    description: 'GitHub 与 OpenAI 合作的 IDE 编程助手。',
    category: 'coding',
    iconDomain: 'github.com',
  },
  // —— 国际 · 图像 / 视频 / 音频 ——
  {
    name: 'Midjourney',
    url: 'https://www.midjourney.com',
    description: '高质量艺术风格文生图，社区驱动。',
    category: 'image',
    iconDomain: 'midjourney.com',
  },
  {
    name: 'Leonardo.ai',
    url: 'https://leonardo.ai',
    description: '游戏与概念美术向的 AI 图像生成平台。',
    category: 'image',
    iconDomain: 'leonardo.ai',
  },
  {
    name: 'Runway',
    url: 'https://runwayml.com',
    description: '文生视频与视频编辑的创意 AI 套件。',
    category: 'video',
    iconDomain: 'runwayml.com',
  },
  {
    name: 'Suno',
    url: 'https://suno.com',
    description: '根据文本生成歌曲与人声的 AI 音乐工具。',
    category: 'audio',
    iconDomain: 'suno.com',
  },
  {
    name: 'ElevenLabs',
    url: 'https://elevenlabs.io',
    description: '逼真语音合成、克隆与多语言配音。',
    category: 'audio',
    iconDomain: 'elevenlabs.io',
  },
  // —— 国内 · 大模型 / 助手 ——
  {
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com',
    description: '深度求索开源友好模型，推理与代码能力强。',
    category: 'ai',
    iconDomain: 'deepseek.com',
  },
  {
    name: '通义千问',
    url: 'https://tongyi.aliyun.com',
    description: '阿里云通义系列，支持网页、App 与 API。',
    category: 'ai',
    iconDomain: 'tongyi.aliyun.com',
  },
  {
    name: '文心一言',
    url: 'https://yiyan.baidu.com',
    description: '百度 ERNIE 大模型对话与创作入口。',
    category: 'ai',
    iconDomain: 'yiyan.baidu.com',
  },
  {
    name: '豆包',
    url: 'https://www.doubao.com',
    description: '字节跳动豆包助手，多模态与 Agent 能力。',
    category: 'ai',
    iconDomain: 'doubao.com',
  },
  {
    name: 'Kimi',
    url: 'https://kimi.moonshot.cn',
    description: '月之暗面 Kimi，擅长长文档阅读与总结。',
    category: 'ai',
    iconDomain: 'moonshot.cn',
  },
  {
    name: '智谱清言',
    url: 'https://chatglm.cn',
    description: '智谱 ChatGLM 官方对话与 GLM-4 系列。',
    category: 'ai',
    iconDomain: 'chatglm.cn',
  },
  {
    name: '讯飞星火',
    url: 'https://xinghuo.xfyun.cn',
    description: '科大讯飞星火认知大模型工作台。',
    category: 'ai',
    iconDomain: 'xfyun.cn',
  },
  {
    name: '腾讯元宝',
    url: 'https://yuanbao.tencent.com',
    description: '腾讯混元大模型 C 端助手与生态整合。',
    category: 'ai',
    iconDomain: 'tencent.com',
  },
  {
    name: '秘塔 AI 搜索',
    url: 'https://metaso.cn',
    description: '国产 AI 搜索，无广告、结构化答案。',
    category: 'search',
    iconDomain: 'metaso.cn',
  },
  {
    name: '扣子 Coze',
    url: 'https://www.coze.cn',
    description: '字节跳动 AI Bot 搭建与工作流平台。',
    category: 'ai',
    iconDomain: 'coze.cn',
  },
  // —— 国内 · 创作 ——
  {
    name: '即梦 AI',
    url: 'https://jimeng.jianying.com',
    description: '剪映系文生图 / 视频创作，适合短视频。',
    category: 'image',
    iconDomain: 'jianying.com',
  },
  {
    name: '可灵 AI',
    url: 'https://klingai.com',
    description: '快手可灵，高质量国产文生视频。',
    category: 'video',
    iconDomain: 'klingai.com',
  },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('缺少 MONGODB_URI，请在 .env.local 中配置')
  }

  const ownerId = process.env.ADMIN_USER_ID?.trim() || undefined

  await mongoose.connect(uri)

  let created = 0
  let updated = 0

  for (const item of SEED_TOOLS) {
    const payload = {
      name: item.name,
      url: item.url,
      description: item.description,
      category: item.category,
      icon: favicon(item.iconDomain),
      isPublic: true,
      ...(ownerId ? { userId: ownerId } : {}),
    }

    const existing = await Tool.findOne({ url: item.url })
    await Tool.findOneAndUpdate(
      { url: item.url },
      { $set: payload },
      { upsert: true, new: true }
    )

    if (existing) updated += 1
    else created += 1
  }

  const total = await Tool.countDocuments({ isPublic: true })
  console.log(`完成：新增 ${created} 条，更新 ${updated} 条；当前公开工具共 ${total} 条。`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
