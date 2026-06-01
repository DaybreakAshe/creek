import {
  GALLERY_MEDIA_TYPES,
  type GalleryMediaType,
} from '@/lib/gallery-types'

export function parseTagsInput(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export function parseGalleryType(value: FormDataEntryValue | null): GalleryMediaType | null {
  if (typeof value !== 'string') return null
  return GALLERY_MEDIA_TYPES.includes(value as GalleryMediaType)
    ? (value as GalleryMediaType)
    : null
}

export function inferGalleryTypeFromMime(mimeType: string): GalleryMediaType {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'document'
}
