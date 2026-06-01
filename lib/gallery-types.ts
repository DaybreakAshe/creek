export const GALLERY_MEDIA_TYPES = ['image', 'video', 'audio', 'document'] as const
export type GalleryMediaType = (typeof GALLERY_MEDIA_TYPES)[number]

export interface GalleryItemRecord {
  _id?: string
  userId: string
  title: string
  description?: string
  type: GalleryMediaType
  mediaUrl: string
  mediaFilename?: string
  mimeType?: string
  tags?: string[]
  altText?: string
  linkUrl?: string
  isPublic?: boolean
  createdAt?: Date
  updatedAt?: Date
}
