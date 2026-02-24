import mongoose, { Schema, model, models } from 'mongoose'

export interface ToolLink {
  _id?: string
  name: string
  url: string
  description?: string
  icon?: string
  category?: string
  createdAt?: Date
  updatedAt?: Date
}

const toolSchema = new Schema<ToolLink>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    category: { type: String, default: 'general' },
  },
  {
    collection: 'tools',
    timestamps: true,
  }
)

const Tool = models.Tool || model<ToolLink>('Tool', toolSchema)

export default Tool
