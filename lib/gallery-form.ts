import { parseFileExtension } from '@/lib/format-file-size'
import {
  GALLERY_MEDIA_TYPES,
  type GalleryMediaType,
  type GalleryUploadMediaType,
} from '@/lib/gallery-types'

const VIDEO_EXTENSIONS = new Set([
  'mp4',
  'webm',
  'mov',
  'm4v',
  'ogv',
  'avi',
  'mkv',
])

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

export function inferGalleryUploadTypeFromFile(
  file: File
): GalleryUploadMediaType | null {
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('image/')) return 'image'
  const ext = parseFileExtension(file.name)
  if (VIDEO_EXTENSIONS.has(ext)) return 'video'
  if (ext) return 'image'
  return null
}

export function inferGalleryUploadTypeFromUrl(
  url: string
): GalleryUploadMediaType {
  try {
    const ext = parseFileExtension(new URL(url.trim()).pathname)
    if (VIDEO_EXTENSIONS.has(ext)) return 'video'
  } catch {
    // invalid URL — default below
  }
  return 'image'
}
