export const GALLERY_MEDIA_TYPES = ['image', 'video', 'audio', 'document'] as const
export type GalleryMediaType = (typeof GALLERY_MEDIA_TYPES)[number]

/** 上传弹窗当前开放的类型 */
export const GALLERY_UPLOAD_MEDIA_TYPES = ['image', 'video'] as const
export type GalleryUploadMediaType = (typeof GALLERY_UPLOAD_MEDIA_TYPES)[number]

export interface GalleryItemRecord {
  _id?: string
  userId: string
  creatorName?: string
  creatorEmail?: string
  title: string
  description?: string
  type: GalleryMediaType
  mediaUrl: string
  mediaFilename?: string
  mimeType?: string
  originalFilename?: string
  fileExtension?: string
  fileSize?: number
  tags?: string[]
  altText?: string
  linkUrl?: string
  isPublic?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}
