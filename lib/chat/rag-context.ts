import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const KNOWLEDGE_PATH = join(process.cwd(), 'docs/creek-knowledge.md')

let cachedRagContext: string | null = null

/** 读取 AI 助手产品知识库（RAG 上下文）。 */
export function getCreekRagContext(): string {
  if (cachedRagContext) return cachedRagContext

  try {
    cachedRagContext = readFileSync(KNOWLEDGE_PATH, 'utf8').trim()
  } catch {
    cachedRagContext = [
      'Creek（https://www.icreek.xyz）是作品展示、工具收藏与 AI 助手网站。',
      '主要路径：/ 首页作品，/tools 公开工具，/tools/mine 我的工具，/gallery/mine 我的作品，/chat AI 聊天（需登录）。',
      '对话记录存于浏览器 localStorage，不按对话 ID 云端同步。',
    ].join('\n\n')
  }

  return cachedRagContext
}

export function buildChatSystemPrompt(): string {
  const knowledge = getCreekRagContext()

  return `你是 Creek 网站（https://www.icreek.xyz）的 AI 助手，友好、简洁、准确。
请用用户使用的语言回复（中文或英文）。

## 回答原则
- 关于 Creek 功能、路径、上传作品、工具、聊天、登录等问题：必须依据下方【产品知识库】作答，不要编造不存在的页面或能力。
- 若知识库未涵盖且与网站无关：礼貌说明并尽量提供通用帮助。
- 涉及管理员操作、环境变量、部署：仅在被明确问到时简要说明，并提醒普通用户通常无需关心。
- 不要声称能替用户在服务器上执行上传、删除或修改数据；应给出操作步骤与对应路径。

## 产品知识库
${knowledge}`
}
