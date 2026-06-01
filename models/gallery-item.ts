import 'server-only'
import mongoose, { Schema, model } from 'mongoose'
import type { GalleryItemRecord } from '@/lib/gallery-types'

const galleryItemSchema = new Schema<GalleryItemRecord>(
  {
    userId: { type: String, required: true, index: true },
    creatorName: { type: String, default: '' },
    creatorEmail: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document'],
      required: true,
    },
    mediaUrl: { type: String, required: true },
    mediaFilename: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    originalFilename: { type: String, default: '' },
    fileExtension: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    altText: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    isPublic: { type: Boolean, default: true, index: true },
  },
  {
    collection: 'gallery_items',
    timestamps: true,
  }
)

const GalleryItemModel =
  mongoose.models.GalleryItem ||
  model<GalleryItemRecord>('GalleryItem', galleryItemSchema)

export default GalleryItemModel
