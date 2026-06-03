import mongoose, { Schema, model, models } from 'mongoose'

export interface ChatMessageDoc {
  sessionId: string
  userId: string
  messageId: string
  role: 'user' | 'assistant' | 'system'
  parts: unknown[]
  seq: number
  createdAt?: Date
  updatedAt?: Date
}

const chatMessageSchema = new Schema<ChatMessageDoc>(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    messageId: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['user', 'assistant', 'system'],
    },
    parts: { type: Schema.Types.Mixed, required: true, default: [] },
    seq: { type: Number, required: true },
  },
  {
    collection: 'chat_messages',
    timestamps: true,
  }
)

chatMessageSchema.index({ sessionId: 1, userId: 1, seq: 1 })

if (models.ChatMessage) {
  delete mongoose.models.ChatMessage
}

const ChatMessage = model<ChatMessageDoc>('ChatMessage', chatMessageSchema)

export default ChatMessage
