/** icon 字段存 Sirv 图片 URL；空或非 URL 时使用默认图标 */
export function isToolIconUrl(icon?: string | null): boolean {
  if (!icon?.trim()) return false
  return /^https?:\/\//i.test(icon.trim())
}

/** 是否可作为 img src 展示（含本地上传时的 blob 预览） */
export function canDisplayToolIcon(icon?: string | null): boolean {
  if (!icon?.trim()) return false
  return /^(https?:|blob:)/i.test(icon.trim())
}
