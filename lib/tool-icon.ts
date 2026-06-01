/** icon 字段存 Sirv 图片 URL；空或非 URL 时使用默认图标 */
export function isToolIconUrl(icon?: string | null): boolean {
  if (!icon?.trim()) return false
  return /^https?:\/\//i.test(icon.trim())
}
