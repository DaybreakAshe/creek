import type { UIMessage } from '@/lib/chat/types'
import { deriveChatTitle, normalizeMessagesForStorage } from '@/lib/chat/message-utils'
import { buildPaginationMeta } from '@/lib/pagination/server'
import type { PaginationParams } from '@/lib/pagination/types'
import ChatSession from '@/models/chat-session'
import ChatMessage from '@/models/chat-message'

export type ChatSessionSummary = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
}

function toSessionSummary(doc: {
  sessionId: string
  title: string
  messageCount: number
  createdAt?: Date
  updatedAt?: Date
}): ChatSessionSummary {
  return {
    id: doc.sessionId,
    title: doc.title,
    messageCount: doc.messageCount,
    createdAt: doc.createdAt?.getTime() ?? Date.now(),
    updatedAt: doc.updatedAt?.getTime() ?? Date.now(),
  }
}

function toUIMessage(doc: {
  messageId: string
  role: 'user' | 'assistant' | 'system'
  parts: unknown[]
}): UIMessage {
  return {
    id: doc.messageId,
    role: doc.role,
    parts: doc.parts as UIMessage['parts'],
  }
}

export async function listChatSessions(
  userId: string,
  pagination: PaginationParams
) {
  const filter = { userId }
  const [total, docs] = await Promise.all([
    ChatSession.countDocuments(filter),
    ChatSession.find(filter)
      .sort({ updatedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
  ])

  return {
    items: docs.map(toSessionSummary),
    pagination: buildPaginationMeta(pagination.page, pagination.limit, total),
  }
}

export async function getChatSessionForUser(userId: string, sessionId: string) {
  const doc = await ChatSession.findOne({ userId, sessionId }).lean()
  if (!doc) return null
  return toSessionSummary(doc)
}

export async function createChatSession(
  userId: string,
  sessionId: string,
  fallbackTitle: string
) {
  const existing = await ChatSession.findOne({ userId, sessionId }).lean()
  if (existing) {
    return toSessionSummary(existing)
  }

  const doc = await ChatSession.create({
    sessionId,
    userId,
    title: fallbackTitle,
    messageCount: 0,
  })

  return toSessionSummary(doc.toObject())
}

export async function deleteChatSession(userId: string, sessionId: string) {
  const result = await ChatSession.deleteOne({ userId, sessionId })
  if (result.deletedCount === 0) return false

  await ChatMessage.deleteMany({ userId, sessionId })
  return true
}

export async function listChatMessages(
  userId: string,
  sessionId: string,
  pagination: PaginationParams,
  order: 'asc' | 'desc' = 'asc'
) {
  const session = await ChatSession.findOne({ userId, sessionId }).lean()
  if (!session) return null

  const filter = { userId, sessionId }
  const sort = order === 'desc' ? { seq: -1 as const } : { seq: 1 as const }
  const [total, docs] = await Promise.all([
    ChatMessage.countDocuments(filter),
    ChatMessage.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
  ])

  let items = docs.map(toUIMessage)
  if (order === 'desc') {
    items = items.reverse()
  }

  return {
    items,
    pagination: buildPaginationMeta(pagination.page, pagination.limit, total),
  }
}

export async function replaceChatMessages(
  userId: string,
  sessionId: string,
  messages: UIMessage[],
  fallbackTitle: string
) {
  const session = await ChatSession.findOne({ userId, sessionId })
  if (!session) return null

  const normalized = normalizeMessagesForStorage(messages)

  await ChatMessage.deleteMany({ userId, sessionId })

  if (normalized.length > 0) {
    await ChatMessage.insertMany(
      normalized.map((message, seq) => ({
        sessionId,
        userId,
        messageId: message.id,
        role: message.role,
        parts: message.parts,
        seq,
      }))
    )
  }

  const title =
    session.title === fallbackTitle
      ? deriveChatTitle(normalized, fallbackTitle)
      : session.title

  session.title = title
  session.messageCount = normalized.length
  await session.save()

  return toSessionSummary(session.toObject())
}

export async function findEmptyChatSession(userId: string) {
  const doc = await ChatSession.findOne({ userId, messageCount: 0 })
    .sort({ updatedAt: -1 })
    .lean()

  return doc ? toSessionSummary(doc) : null
}
