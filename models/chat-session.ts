import mongoose, { Schema, model, models } from 'mongoose'

export interface ChatSessionDoc {
  sessionId: string
  userId: string
  title: string
  messageCount: number
  createdAt?: Date
  updatedAt?: Date
}

const chatSessionSchema = new Schema<ChatSessionDoc>(
  {
    sessionId: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: '' },
    messageCount: { type: Number, required: true, default: 0 },
  },
  {
    collection: 'chat_sessions',
    timestamps: true,
  }
)

chatSessionSchema.index({ userId: 1, updatedAt: -1 })
chatSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true })

if (models.ChatSession) {
  delete mongoose.models.ChatSession
}

const ChatSession = model<ChatSessionDoc>('ChatSession', chatSessionSchema)

export default ChatSession
