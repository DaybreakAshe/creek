import mongoose, { Schema, model, models } from 'mongoose'

export interface ToolLink {
  _id?: string
  userId?: string
  name: string
  url: string
  description?: string
  icon?: string
  category?: string
  isPublic?: boolean
  createdAt?: Date
  updatedAt?: Date
}

const toolSchema = new Schema<ToolLink>(
  {
    userId: { type: String, index: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    category: { type: String, default: 'general' },
    isPublic: { type: Boolean, default: false },
  },
  {
    collection: 'tools',
    timestamps: true,
  }
)

if (models.Tool) {
  delete mongoose.models.Tool
}

const Tool = model<ToolLink>('Tool', toolSchema)

export default Tool
